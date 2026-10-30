import { API_URL, APP_TOKEN } from "./config";

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

/** A detection in pixels of the uploaded image; x/y is the box CENTER. */
export type DetectedBox = {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
};

export type DetectResult = {
  count: number;
  boxes: DetectedBox[];
  imageWidth: number | null;
  imageHeight: number | null;
};

const REQUEST_TIMEOUT_MS = 30_000;

/** Sends ONE prepared image (base64 JPEG) to the proxy and returns its detections. */
export async function detectChickens(base64: string): Promise<DetectResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "X-App-Token": APP_TOKEN, "Content-Type": "text/plain" },
      body: base64,
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = (await res.text()).slice(0, 200);
      throw new ApiError(`Server error ${res.status}: ${text}`, res.status);
    }

    const data = await res.json();
    if (typeof data.count !== "number" || !Array.isArray(data.boxes)) {
      throw new ApiError(
        "The server didn't send box positions. Has the proxy been updated to the v2 version and redeployed?"
      );
    }
    return {
      count: data.count,
      boxes: data.boxes,
      imageWidth: typeof data.imageWidth === "number" ? data.imageWidth : null,
      imageHeight: typeof data.imageHeight === "number" ? data.imageHeight : null,
    };
  } catch (e) {
    if (e instanceof ApiError) throw e;
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error("Request timed out. Check your connection and try again.");
    }
    throw new Error("Network error. Check your connection and try again.");
  } finally {
    clearTimeout(timer);
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Retries network failures and 5xx errors once with a short backoff. Client
 * errors (bad token, image too large, outdated proxy) aren't retried since
 * they'd fail the same way again.
 */
export async function detectChickensWithRetry(base64: string, attempts = 2): Promise<DetectResult> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await detectChickens(base64);
    } catch (e) {
      lastError = e;
      const status = e instanceof ApiError ? e.status : undefined;
      const retryable = (e instanceof ApiError ? status !== undefined && status >= 500 : true);
      if (!retryable || i === attempts - 1) break;
      await sleep(1000 * 2 ** i);
    }
  }
  throw lastError;
}
