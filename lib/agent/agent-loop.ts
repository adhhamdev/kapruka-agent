import {
  AGENT_TEMPERATURE,
  GEMINI_MODEL,
  MAX_AGENT_TURNS,
} from '@/constants/agent';
import { WIDGET_ONLY_FALLBACK } from '@/constants/languages';
import type { CartItem } from '@/lib/cart-storage';
import { geminiClient } from '@/lib/agent/gemini-client';
import { SYSTEM_INSTRUCTION } from '@/lib/agent/system-instruction';
import { TOOL_DECLARATIONS } from '@/lib/agent/tool-declarations';
import {
  buildCartContextMessage,
  executeToolCall,
} from '@/lib/agent/tool-executor';
import { buildMessageParts } from '@/lib/agent/build-message-parts';
import type { ChatHistoryEntry } from '@/types/chat';
import type { Widget } from '@/types/widgets';

export interface AgentRunResult {
  text: string;
  widgets: Widget[];
  cart: CartItem[];
}

export async function runAgentLoop(
  messages: ChatHistoryEntry[],
  initialCart: CartItem[],
): Promise<AgentRunResult> {
  const contents: any[] = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : m.role,
    parts: buildMessageParts(m),
  }));

  contents.push({
    role: 'user',
    parts: [{ text: buildCartContextMessage(initialCart) }],
  });

  const widgets: Widget[] = [];
  let updatedCart = [...initialCart];
  let finalResponseText =
    "I'm having a little trouble right now. Could you try asking again?";

  for (let loop = 0; loop < MAX_AGENT_TURNS; loop++) {
    console.log(`[Agent Turn ${loop}] calling gemini generateContent...`);

    const response = await geminiClient.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ functionDeclarations: TOOL_DECLARATIONS as never[] }],
        temperature: AGENT_TEMPERATURE,
      },
    });

    const candidate = response.candidates?.[0];
    const rootMessage = candidate?.content;
    if (!rootMessage) break;

    contents.push(rootMessage);

    const functionCalls = response.functionCalls;
    if (!functionCalls || functionCalls.length === 0) {
      finalResponseText = response.text || '';
      break;
    }

    console.log(
      `[Agent Turn ${loop}] Executing ${functionCalls.length} tool calls in parallel.`,
    );

    const toolParts: any[] = [];

    for (const call of functionCalls) {
      const { name, args, id } = call as {
        name: string;
        args: Record<string, unknown>;
        id: string;
      };

      let toolResult: Record<string, unknown>;

      try {
        const result = await executeToolCall(
          name,
          args ?? {},
          updatedCart,
          widgets,
        );
        toolResult = result.toolResult;
        updatedCart = result.cart;
        widgets.length = 0;
        widgets.push(...result.widgets);
      } catch (err: unknown) {
        const internal =
          err instanceof Error ? err.message : 'Tool execution failed';
        console.error(`[Error executing tool ${name}]:`, internal);
        toolResult = {
          error: 'A shopping action could not be completed. Please try again.',
        };
      }

      toolParts.push({
        functionResponse: {
          name,
          response: toolResult,
          id,
        },
      });
    }

    contents.push({
      role: 'tool',
      parts: toolParts,
    });
  }

  const text =
    finalResponseText.trim() ||
    (widgets.length > 0 ? WIDGET_ONLY_FALLBACK : finalResponseText);

  return {
    text,
    widgets,
    cart: updatedCart,
  };
}
