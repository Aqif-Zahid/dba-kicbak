import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { readable, writable } = new TransformStream();
  const encoder = new TextEncoder();

  const signal = (request as any).signal as AbortSignal | undefined;

  const headers = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  };

  const writer = writable.getWriter();
  let closed = false;

  const safeSend = async (data: unknown) => {
    if (closed) return;
    try {
      await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    } catch {
      closed = true;
      try { await writer.close(); } catch {}
      clearInterval(keepAliveId);
      clearTimeout(timeoutId);
    }
  };

  // ─────────────────────────────
  // Initial event
  // ─────────────────────────────
  await safeSend({ ok: true, event: "connected" });

  // ─────────────────────────────
  // Keep-alive ping (every 20s)
  // ─────────────────────────────
  const keepAliveId = setInterval(() => {
    void safeSend({ event: "ping", ts: Date.now() });
  }, 20000);

  // ─────────────────────────────
  // Auto-close before Vercel timeout (≈290s)
  // ─────────────────────────────
  const timeoutId = setTimeout(async () => {
    if (closed) return;
    closed = true;
    clearInterval(keepAliveId);
    await safeSend({ event: "disconnect", reason: "timeout" });
    try { await writer.close(); } catch {}
  }, 290000); // 4m 50s

  // ─────────────────────────────
  // Handle client disconnects
  // ─────────────────────────────
  const onAbort = () => {
    if (closed) return;
    closed = true;
    clearInterval(keepAliveId);
    clearTimeout(timeoutId);
    writer.close().catch(() => {});
  };
  signal?.addEventListener("abort", onAbort, { once: true });

  return new NextResponse(readable as any, { headers });
}
