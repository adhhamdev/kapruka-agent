import type { KaprukaAgentUIMessage } from '@/types/agent-ui-message';

export function hasUserMessages(messages: KaprukaAgentUIMessage[]): boolean {
  return messages.some((message) => message.role === 'user');
}

export function isWelcomePlaceholderMessage(
  message: KaprukaAgentUIMessage,
): boolean {
  return message.id === 'welcome';
}

export function visibleConversationMessages(
  messages: KaprukaAgentUIMessage[],
): KaprukaAgentUIMessage[] {
  if (!hasUserMessages(messages)) {
    return messages.filter((message) => !isWelcomePlaceholderMessage(message));
  }
  return messages;
}

export function isChatHomeState(messages: KaprukaAgentUIMessage[]): boolean {
  return !hasUserMessages(messages);
}
