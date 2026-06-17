/**
 * User-facing error messages for Kapruka Agent.
 * Never expose stack traces, API keys, or internal error strings to the client.
 */

export const ERROR_MESSAGES = {
  NETWORK:
    "We couldn't reach Agent right now. Please check your connection and try again.",
  TIMEOUT:
    'Agent is taking longer than usual. Please wait a moment and try again.',
  SERVICE_UNAVAILABLE:
    'Our shopping assistant is temporarily unavailable. Please try again in a few minutes.',
  INVALID_REQUEST:
    "Something didn't look right with that request. Please try sending your message again.",
  RATE_LIMITED:
    "You're sending messages quickly. Please wait a moment before trying again.",
  CART_PARSE:
    "We couldn't load your saved basket. Starting with an empty cart.",
  CHAT_EMPTY:
    'Please type a message before sending.',
  GENERIC:
    'Something went wrong on our end. Please try again, or refresh the page.',
} as const;

export type ErrorCode = keyof typeof ERROR_MESSAGES;

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly statusCode: number = 500,
    /** Internal detail — logged server-side only */
    public readonly internalMessage?: string,
  ) {
    super(ERROR_MESSAGES[code]);
    this.name = 'AppError';
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
    };
  }
}

/** Map HTTP status codes to friendly messages */
export function httpStatusToMessage(status: number): string {
  if (status === 400) return ERROR_MESSAGES.INVALID_REQUEST;
  if (status === 429) return ERROR_MESSAGES.RATE_LIMITED;
  if (status === 503) return ERROR_MESSAGES.SERVICE_UNAVAILABLE;
  if (status >= 500) return ERROR_MESSAGES.SERVICE_UNAVAILABLE;
  if (status === 0 || status >= 400) return ERROR_MESSAGES.NETWORK;
  return ERROR_MESSAGES.GENERIC;
}

/** Parse API error response safely — never leak raw server messages */
export async function parseApiError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (data?.error && typeof data.error === 'string') {
      const known = Object.values(ERROR_MESSAGES) as string[];
      if (known.includes(data.error)) return data.error;
    }
  } catch {
    /* response body not JSON */
  }
  return httpStatusToMessage(response.status);
}

/** Safe cart localStorage read */
export function safeParseCart(raw: string | null): unknown[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
