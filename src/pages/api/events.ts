import type { APIRoute } from "astro";

// A minimal server-sent-events (SSE) heartbeat stream, kept from the starter
// because the deploy workflow (.github/workflows/checks.yml) probes this
// endpoint directly to confirm the deployed app can hold a streaming
// response open. Nothing in the assessment planner emits events over it.
export const GET: APIRoute = () => {
  let heartbeat: ReturnType<typeof setInterval>;

  const stream = new ReadableStream<string>({
    start(controller) {
      // an opening comment so the client (and the post-deploy CI probe) sees
      // bytes immediately, and a periodic one so proxies don't drop the
      // connection as idle
      controller.enqueue(": connected\n\n");
      heartbeat = setInterval(() => controller.enqueue(": ping\n\n"), 30_000);
    },
    cancel() {
      clearInterval(heartbeat);
    },
  });

  return new Response(stream.pipeThrough(new TextEncoderStream()), {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
    },
  });
};
