import { ToolLoopAgent, stepCountIs } from 'ai';
import { z } from 'zod';
import {
  AGENT_TEMPERATURE,
  MAX_AGENT_TURNS,
} from '@/constants/agent';
import { SYSTEM_INSTRUCTION } from '@/lib/agent/system-instruction';
import { getKaprukaModel } from '@/lib/agents/kapruka-model';
import type { CartItem } from '@/lib/cart-storage';
import {
  buildCartContextMessage,
  cartItemSchema,
  createKaprukaTools,
  type AgentUiFlags,
} from '@/lib/tools/kapruka-tools';

export function createKaprukaAgent(
  cartRef: { current: CartItem[] },
  uiFlagsRef: { current: AgentUiFlags } = { current: { openBasket: false } },
) {
  return new ToolLoopAgent({
    model: getKaprukaModel(),
    instructions: SYSTEM_INSTRUCTION,
    temperature: AGENT_TEMPERATURE,
    stopWhen: stepCountIs(MAX_AGENT_TURNS),
    tools: createKaprukaTools(cartRef, uiFlagsRef),
    callOptionsSchema: z.object({
      cart: z.array(cartItemSchema),
    }),
    prepareCall: ({ options, ...settings }) => ({
      ...settings,
      instructions: `${SYSTEM_INSTRUCTION}\n\n${buildCartContextMessage(options.cart)}`,
    }),
  });
}
