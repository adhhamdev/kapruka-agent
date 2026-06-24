import { GoogleGenAI, Modality } from '@google/genai';
import {
  LIVE_MODEL,
  LIVE_TOKEN_TTL_SECONDS,
  LIVE_TOKEN_USES,
} from '@/constants/live';
import { buildAgentInstructions } from '@/lib/agent/build-agent-instructions';
import { getLiveToolsConfig } from '@/lib/agent/tool-definitions';
import { createLiveSessionId, touchToolSession } from '@/lib/agent/tool-session-store';
import { cartItemSchema } from '@/lib/tools/kapruka-tools';
import { isAppLocale } from '@/types/locale';
import { z } from 'zod';

export const runtime = 'nodejs';

const tokenRequestSchema = z.object({
  cart: z.array(cartItemSchema),
  memoryUserId: z.string().trim().min(1).optional(),
  preferredLanguage: z.enum(['en', 'si', 'ta']).optional(),
  liveSessionId: z.string().trim().min(1).optional(),
});

function getGeminiApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  return key || null;
}

export async function POST(req: Request) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return Response.json({ error: 'Server configuration error' }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = tokenRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { cart, memoryUserId, preferredLanguage, liveSessionId: existingSessionId } =
    parsed.data;
  const liveSessionId = existingSessionId ?? createLiveSessionId();
  if (existingSessionId) {
    touchToolSession(existingSessionId);
  }
  const systemInstruction = buildAgentInstructions({
    cart,
    preferredLanguage: isAppLocale(preferredLanguage)
      ? preferredLanguage
      : undefined,
    memoryUserId,
  });

  const expireTime = new Date(
    Date.now() + LIVE_TOKEN_TTL_SECONDS * 1000,
  ).toISOString();

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { apiVersion: 'v1alpha' },
    });

    const token = await ai.authTokens.create({
      config: {
        uses: LIVE_TOKEN_USES,
        expireTime,
        liveConnectConstraints: {
          model: LIVE_MODEL,
          config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: { parts: [{ text: systemInstruction }] },
            tools: getLiveToolsConfig(),
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            contextWindowCompression: { slidingWindow: {} },
          },
        },
      },
    });

    if (!token.name) {
      return Response.json(
        { error: 'Failed to create ephemeral token' },
        { status: 500 },
      );
    }

    return Response.json({
      token: token.name,
      liveSessionId,
      model: LIVE_MODEL,
      expiresAt: expireTime,
    });
  } catch (error) {
    console.error('[Live Token] Failed:', error);
    return Response.json(
      { error: 'Failed to create live session token' },
      { status: 500 },
    );
  }
}
