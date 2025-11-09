import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { readable, writable } = new TransformStream();
  const encoder = new TextEncoder();

  // Signal for client disconnects
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
      // writer is closed or errored
      closed = true;
      try { await writer.close(); } catch {}
      clearInterval(keepAliveId);
    }
  };

  // Initial greeting
  await safeSend({ ok: true, event: "connected" });

  // Keep-alive ping every 20s to avoid proxies killing the stream
  const keepAliveId = setInterval(() => {
    void safeSend({ event: "ping", ts: Date.now() });
  }, 20000);

  // Handle client abort
  const onAbort = () => {
    if (closed) return;
    closed = true;
    clearInterval(keepAliveId);
    writer.close().catch(() => {});
  };
  signal?.addEventListener("abort", onAbort, { once: true });

  return new NextResponse(readable as any, { headers });
}
