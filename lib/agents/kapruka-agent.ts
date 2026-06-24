import { ToolLoopAgent, stepCountIs } from 'ai';
import { z } from 'zod';
import {
  AGENT_TEMPERATURE,
  MAX_AGENT_TURNS,
} from '@/constants/agent';
import { buildAgentInstructions } from '@/lib/agent/build-agent-instructions';
import { SYSTEM_INSTRUCTION } from '@/lib/agent/system-instruction';
import { getKaprukaModel } from '@/lib/agents/kapruka-model';
import type { CartItem } from '@/lib/cart-storage';
import {
  createSupermemoryTools,
  isSupermemoryEnabled,
} from '@/lib/supermemory/tools';
import {
  cartItemSchema,
  createKaprukaTools,
  type AgentUiFlags,
} from '@/lib/tools/kapruka-tools';

export function createKaprukaAgent(
  cartRef: { current: CartItem[] },
  uiFlagsRef: { current: AgentUiFlags } = { current: { openBasket: false } },
  memoryUserId?: string,
) {
  const kaprukaTools = createKaprukaTools(cartRef, uiFlagsRef);
  const memoryTools =
    memoryUserId && isSupermemoryEnabled()
      ? createSupermemoryTools(memoryUserId)
      : {};

  return new ToolLoopAgent({
    model: getKaprukaModel(),
    instructions: SYSTEM_INSTRUCTION,
    temperature: AGENT_TEMPERATURE,
    stopWhen: stepCountIs(MAX_AGENT_TURNS),
    tools: { ...kaprukaTools, ...memoryTools },
    callOptionsSchema: z.object({
      cart: z.array(cartItemSchema),
      memoryUserId: z.string().trim().min(1).optional(),
      preferredLanguage: z.enum(['en', 'si', 'ta']).optional(),
    }),
    prepareCall: ({ options, ...settings }) => {
      const scopedMemoryUserId = options.memoryUserId ?? memoryUserId;
      const scopedMemoryTools =
        scopedMemoryUserId && isSupermemoryEnabled()
          ? createSupermemoryTools(scopedMemoryUserId)
          : {};

      return {
        ...settings,
        instructions: buildAgentInstructions({
          cart: options.cart,
          preferredLanguage: options.preferredLanguage,
          memoryUserId: scopedMemoryUserId,
        }),
        tools: { ...kaprukaTools, ...scopedMemoryTools },
      };
    },
  });
}
