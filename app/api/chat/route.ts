import { NextRequest, NextResponse } from 'next/server';
import { runAgentLoop } from '@/lib/agent/agent-loop';
import { validateAttachmentPayload } from '@/lib/attachment-validation';
import type { CartItem } from '@/lib/cart-storage';
import { AppError, ERROR_MESSAGES } from '@/lib/errors';
import type { ChatHistoryEntry } from '@/types/chat';

export const runtime = 'nodejs';

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

    for (const entry of messages as ChatHistoryEntry[]) {
      const validation = validateAttachmentPayload(entry.attachments);
      if (!validation.ok) {
        throw new AppError('INVALID_REQUEST', 400, validation.message);
      }
    }

    const result = await runAgentLoop(
      messages as ChatHistoryEntry[],
      cart as CartItem[],
    );

    return NextResponse.json({
      text: result.text,
      widgets: result.widgets,
      cart: result.cart,
    });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      if (error.internalMessage) {
        console.error(`[api/chat] ${error.code}:`, error.internalMessage);
      }
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    const internal =
      error instanceof Error ? error.message : 'Unknown server error';
    console.error('[POST api/chat Error]:', internal);
    return NextResponse.json(
      { error: ERROR_MESSAGES.GENERIC, code: 'GENERIC' },
      { status: 500 },
    );
  }
}
