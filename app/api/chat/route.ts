import { NextRequest } from 'next/server';
import { createAgentUIStreamResponse } from 'ai';
import { createKaprukaAgent } from '@/lib/agents/kapruka-agent';
import type { CartItem } from '@/lib/cart-storage';
import { AppError, ERROR_MESSAGES } from '@/lib/errors';
import { validateUiMessageAttachments } from '@/lib/validate-ui-attachments';
import type { KaprukaAgentUIMessage } from '@/types/agent-ui-message';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error('[api/chat] GEMINI_API_KEY is not configured');
      throw new AppError('SERVICE_UNAVAILABLE', 503, 'Missing GEMINI_API_KEY');
    }

    let body: { messages?: unknown; cart?: unknown };
    try {
      body = await req.json();
    } catch {
      throw new AppError('INVALID_REQUEST', 400, 'Invalid JSON body');
    }

    const { messages, cart = [] } = body;

    if (!messages || !Array.isArray(messages)) {
      throw new AppError('INVALID_REQUEST', 400, 'Missing or invalid messages');
    }

    if (!Array.isArray(cart)) {
      throw new AppError('INVALID_REQUEST', 400, 'Invalid cart payload');
    }

    const attachmentValidation = validateUiMessageAttachments(
      messages as KaprukaAgentUIMessage[],
    );
    if (!attachmentValidation.ok) {
      throw new AppError('INVALID_REQUEST', 400, attachmentValidation.message);
    }

    const cartRef = { current: cart as CartItem[] };
    const agent = createKaprukaAgent(cartRef);

    return createAgentUIStreamResponse({
      agent,
      uiMessages: messages,
      options: { cart: cartRef.current },
      messageMetadata: ({ part }) => {
        if (part.type === 'finish') {
          return { cart: cartRef.current };
        }
        return undefined;
      },
    });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      if (error.internalMessage) {
        console.error(`[api/chat] ${error.code}:`, error.internalMessage);
      }
      return Response.json(error.toJSON(), { status: error.statusCode });
    }

    const internal =
      error instanceof Error ? error.message : 'Unknown server error';
    console.error('[POST api/chat Error]:', internal);
    return Response.json(
      { error: ERROR_MESSAGES.GENERIC, code: 'GENERIC' },
      { status: 500 },
    );
  }
}
