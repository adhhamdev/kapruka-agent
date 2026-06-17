import type { ChatHistoryEntry } from '@/types/chat';

/** Build Gemini content parts from a chat message (text + inline files/images). */
export function buildMessageParts(entry: ChatHistoryEntry): Array<Record<string, unknown>> {
  const parts: Array<Record<string, unknown>> = [];

  if (entry.content.trim()) {
    parts.push({ text: entry.content });
  }

  for (const attachment of entry.attachments ?? []) {
    if (
      attachment.mimeType.startsWith('image/') ||
      attachment.mimeType === 'application/pdf'
    ) {
      parts.push({
        inlineData: {
          mimeType: attachment.mimeType,
          data: attachment.data,
        },
      });
    } else if (attachment.mimeType.startsWith('text/')) {
      try {
        const decoded = Buffer.from(attachment.data, 'base64').toString('utf-8');
        parts.push({
          text: `\n[Attached file: ${attachment.name}]\n${decoded}`,
        });
      } catch {
        parts.push({
          text: `\n[Attached file: ${attachment.name} — could not read contents]`,
        });
      }
    } else {
      parts.push({
        text: `\n[Attached file: ${attachment.name} (${attachment.mimeType})]`,
      });
    }
  }

  if (parts.length === 0) {
    parts.push({ text: '(empty message)' });
  }

  return parts;
}
