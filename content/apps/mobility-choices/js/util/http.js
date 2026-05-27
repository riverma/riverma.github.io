// fetch wrapper with timeout via AbortController. No retries, no caching — callers add those.

const DEFAULT_TIMEOUT_MS = 12_000;

export async function httpGet(url, { timeoutMs = DEFAULT_TIMEOUT_MS, signal, headers } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error('timeout')), timeoutMs);
  // Caller's external signal short-circuits ours.
  if (signal) signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true });
  try {
    return await fetch(url, { signal: controller.signal, headers });
  } finally {
    clearTimeout(timer);
  }
}

export async function httpGetJson(url, opts) {
  const res = await httpGet(url, opts);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new HttpError(`HTTP ${res.status} from ${url}: ${body.slice(0, 200)}`, res.status);
  }
  return res.json();
}

export class HttpError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}
