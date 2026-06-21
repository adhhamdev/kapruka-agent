import type { KaprukaAgentUIMessage } from '@/types/agent-ui-message';

const ADDED_TO_BASKET_TEXT =
  /^Added \*\*(.+)\*\* to your basket\.?$/;

export function isAddedToBasketMessage(
  message: KaprukaAgentUIMessage,
): boolean {
  if (message.metadata?.basketAdded) return true;
  if (message.role !== 'assistant') return false;

  const text = message.parts
    .filter((part) => part.type === 'text')
    .map((part) => (part.type === 'text' ? part.text : ''))
    .join('')
    .trim();

  return ADDED_TO_BASKET_TEXT.test(text);
}

export function messageShouldOpenBasket(
  message: KaprukaAgentUIMessage,
): boolean {
  return Boolean(message.metadata?.openBasket);
}
