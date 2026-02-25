import { subscribe, unsubscribe } from '@/lib/broadcaster';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
        return new Response('projectId required', { status: 400 });
    }

    // Fetch recent messages to send as initial data
    const recent = await prisma.message.findMany({
        where: { projectId },
        orderBy: { createdAt: 'asc' },
        take: 50,
    });

    let ctrl: ReadableStreamDefaultController<Uint8Array>;

    const stream = new ReadableStream<Uint8Array>({
        start(controller) {
            ctrl = controller;
            subscribe(projectId, controller);

            // Send existing messages immediately as a bootstrap event
            const init = `data: ${JSON.stringify({ type: 'init', messages: recent })}\n\n`;
            controller.enqueue(new TextEncoder().encode(init));

            // Keep-alive ping every 25 s so proxies don't time out the connection
            const ping = setInterval(() => {
                try { controller.enqueue(new TextEncoder().encode(': ping\n\n')); }
                catch { clearInterval(ping); }
            }, 25000);

            // Cleanup when the client disconnects
            req.signal?.addEventListener('abort', () => {
                clearInterval(ping);
                unsubscribe(projectId, ctrl);
                try { controller.close(); } catch { /* already closed */ }
            });
        },
        cancel() {
            unsubscribe(projectId, ctrl);
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    });
}
