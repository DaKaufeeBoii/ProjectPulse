// ─────────────────────────────────────────────────────────────────
// SSE Broadcaster — singleton Map of open stream controllers.
// One Set<TransformStreamDefaultController> per projectId.
// ─────────────────────────────────────────────────────────────────

type Ctrl = ReadableStreamDefaultController<Uint8Array>;

// globalThis singleton so it persists across hot reseloads
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;
if (!g.__ppStreams) g.__ppStreams = new Map<string, Set<Ctrl>>();
const streams: Map<string, Set<Ctrl>> = g.__ppStreams;

export function subscribe(projectId: string, ctrl: Ctrl): void {
    if (!streams.has(projectId)) streams.set(projectId, new Set());
    streams.get(projectId)!.add(ctrl);
}

export function unsubscribe(projectId: string, ctrl: Ctrl): void {
    streams.get(projectId)?.delete(ctrl);
}

export function publish(projectId: string, data: object): void {
    const event = `data: ${JSON.stringify(data)}\n\n`;
    const encoded = new TextEncoder().encode(event);
    streams.get(projectId)?.forEach(ctrl => {
        try { ctrl.enqueue(encoded); } catch { /* connection closed */ }
    });
}
