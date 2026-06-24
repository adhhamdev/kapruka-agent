import { deleteToolSession } from '@/lib/agent/tool-session-store';
import { z } from 'zod';

export const runtime = 'nodejs';

const deleteSchema = z.object({
  liveSessionId: z.string().min(1),
});

export async function DELETE(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  deleteToolSession(parsed.data.liveSessionId);
  return Response.json({ ok: true });
}
