let messageCounter = 0;

/** Stable message IDs without impure Date.now() during render analysis. */
export function createMessageId(prefix: string): string {
  messageCounter += 1;
  return `${prefix}-${messageCounter}`;
}
