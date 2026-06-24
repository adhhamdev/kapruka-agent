import { buildDateTimeContextMessage } from '@/lib/agent/datetime-context';
import { buildLanguageInstruction } from '@/lib/agent/language-instruction';
import { MEMORY_INSTRUCTION } from '@/lib/agent/memory-instruction';
import { SYSTEM_INSTRUCTION } from '@/lib/agent/system-instruction';
import { buildCartContextMessage } from '@/lib/agent/cart-context';
import { isSupermemoryEnabled } from '@/lib/supermemory/tools';
import type { CartItem } from '@/lib/cart-storage';
import { isAppLocale, type AppLocale } from '@/types/locale';

export interface BuildAgentInstructionsOptions {
  cart: CartItem[];
  preferredLanguage?: AppLocale;
  memoryUserId?: string;
}

export function buildAgentInstructions(
  options: BuildAgentInstructionsOptions,
): string {
  const blocks = [
    SYSTEM_INSTRUCTION,
    buildDateTimeContextMessage(),
    buildCartContextMessage(options.cart),
  ];

  if (options.preferredLanguage && isAppLocale(options.preferredLanguage)) {
    blocks.push(buildLanguageInstruction(options.preferredLanguage));
  }

  if (options.memoryUserId && isSupermemoryEnabled()) {
    blocks.push(MEMORY_INSTRUCTION);
  }

  return blocks.join('\n\n');
}
