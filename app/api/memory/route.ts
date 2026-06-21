import { NextRequest } from 'next/server';
import {
  addSavedMemory,
  clearAllSavedMemories,
  fetchSavedInfoSnapshot,
  forgetSavedMemory,
  memoryFeatureEnabled,
} from '@/lib/supermemory/service';
import { AppError } from '@/lib/errors';

export const runtime = 'nodejs';

function parseMemoryUserId(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export async function GET(req: NextRequest) {
  const memoryUserId = parseMemoryUserId(
    req.nextUrl.searchParams.get('memoryUserId'),
  );

  if (!memoryUserId) {
    return Response.json(fetchSavedInfoSnapshotFallback(memoryFeatureEnabled()));
  }

  try {
    const snapshot = await fetchSavedInfoSnapshot(memoryUserId);
    return Response.json(snapshot);
  } catch {
    return Response.json(fetchSavedInfoSnapshotFallback(memoryFeatureEnabled()));
  }
}

function fetchSavedInfoSnapshotFallback(enabled: boolean) {
  return {
    enabled,
    available: false,
    people: [],
    addresses: [],
    preferences: [],
    language: [],
    other: [],
  };
}

export async function POST(req: NextRequest) {
  try {
    let body: { memoryUserId?: unknown; memory?: unknown };
    try {
      body = await req.json();
    } catch {
      throw new AppError('INVALID_REQUEST', 400, 'Invalid JSON body');
    }

    const memoryUserId = parseMemoryUserId(body.memoryUserId);
    const memory = typeof body.memory === 'string' ? body.memory : '';

    if (!memoryUserId) {
      return Response.json(
        { ok: false, message: 'Could not save right now.' },
        { status: 400 },
      );
    }

    const result = await addSavedMemory(memoryUserId, memory);
    return Response.json(result, { status: result.ok ? 200 : 503 });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return Response.json(
        { ok: false, message: 'Could not save right now.' },
        { status: error.statusCode },
      );
    }
    return Response.json(
      { ok: false, message: 'Could not save right now.' },
      { status: 503 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    let body: {
      memoryUserId?: unknown;
      id?: unknown;
      text?: unknown;
      clearAll?: unknown;
    };
    try {
      body = await req.json();
    } catch {
      throw new AppError('INVALID_REQUEST', 400, 'Invalid JSON body');
    }

    const memoryUserId = parseMemoryUserId(body.memoryUserId);
    if (!memoryUserId) {
      return Response.json(
        { ok: false, message: 'Could not update saved info.' },
        { status: 400 },
      );
    }

    if (body.clearAll === true) {
      const result = await clearAllSavedMemories(memoryUserId);
      return Response.json(result, { status: result.ok ? 200 : 503 });
    }

    const id = typeof body.id === 'string' ? body.id : undefined;
    const text = typeof body.text === 'string' ? body.text : undefined;
    const result = await forgetSavedMemory(memoryUserId, { id, text });
    return Response.json(result, { status: result.ok ? 200 : 503 });
  } catch {
    return Response.json(
      { ok: false, message: 'Could not update saved info.' },
      { status: 503 },
    );
  }
}
