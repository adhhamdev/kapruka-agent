import { generateId } from 'ai';
import {
  executeKaprukaTool,
  isKaprukaToolName,
  type AgentUiFlags,
} from '@/lib/agent/execute-kapruka-tool';
import {
  getOrCreateToolSession,
  touchToolSession,
} from '@/lib/agent/tool-session-store';
import { cartItemSchema } from '@/lib/tools/kapruka-tools';
import type { Widget } from '@/types/widgets';
import { isAppLocale, type AppLocale } from '@/types/locale';
import { z } from 'zod';

export const runtime = 'nodejs';

const functionCallSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  args: z.record(z.string(), z.unknown()).optional(),
});

const toolsRequestSchema = z.object({
  liveSessionId: z.string().min(1),
  functionCalls: z.array(functionCallSchema).min(1),
  cart: z.array(cartItemSchema),
  memoryUserId: z.string().trim().min(1).optional(),
  preferredLanguage: z.enum(['en', 'si', 'ta']).optional(),
});

export interface LiveUiEvent {
  toolCallId: string;
  toolName: string;
  widget: Widget;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = toolsRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { liveSessionId, functionCalls, cart } = parsed.data;
  touchToolSession(liveSessionId);
  const session = getOrCreateToolSession(liveSessionId);

  let currentCart = [...cart];
  const uiFlags: AgentUiFlags = { openBasket: false };
  const uiEvents: LiveUiEvent[] = [];

  const functionResponses = [];

  for (const call of functionCalls) {
    const callId = call.id ?? generateId();
    const name = call.name;
    const args = call.args ?? {};

    if (!isKaprukaToolName(name)) {
      functionResponses.push({
        id: callId,
        name,
        response: { error: `Unknown tool: ${name}` },
      });
      continue;
    }

    try {
      const outcome = await executeKaprukaTool(name, args, {
        session,
        cart: currentCart,
        uiFlags,
      });

      if (outcome.cart) {
        currentCart = outcome.cart;
      }
      if (outcome.uiFlags?.openBasket) {
        uiFlags.openBasket = true;
      }
      if (outcome.uiFlags?.localeChange) {
        uiFlags.localeChange = outcome.uiFlags.localeChange;
      }

      if (outcome.widget) {
        uiEvents.push({
          toolCallId: callId,
          toolName: name,
          widget: outcome.widget,
        });
      }

      functionResponses.push({
        id: callId,
        name,
        response: outcome.result,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Tool execution failed';
      functionResponses.push({
        id: callId,
        name,
        response: { error: message },
      });
    }
  }

  const response: {
    functionResponses: typeof functionResponses;
    uiEvents: LiveUiEvent[];
    cart: typeof currentCart;
    openBasket?: boolean;
    localeChange?: AppLocale;
  } = {
    functionResponses,
    uiEvents,
    cart: currentCart,
  };

  if (uiFlags.openBasket) {
    response.openBasket = true;
  }
  if (uiFlags.localeChange && isAppLocale(uiFlags.localeChange)) {
    response.localeChange = uiFlags.localeChange;
  }

  return Response.json(response);
}
