/**
 * Chicken Counter proxy (Cloudflare Worker)
 *
 * Phone  ->  this proxy (holds the Roboflow key)  ->  Roboflow  ->  { count, boxes }
 *
 * The phone sends ONE image per request as a raw base64 string in the body
 * (Content-Type: text/plain) plus an X-App-Token header. The proxy forwards
 * it to Roboflow with header-based auth and returns the detections at or
 * above CONFIDENCE (count + box coordinates). Because the threshold lives here, you
 * can tune it later without rebuilding the app.
 *
 * Secrets (set with `npx wrangler secret put ...`, never in this file):
 *   ROBOFLOW_API_KEY  - your Roboflow key
 *   APP_TOKEN         - long random string the app must send
 * Plain vars (wrangler.toml): MODEL_ID, CONFIDENCE
 */

const MAX_BODY_BYTES = 8 * 1024 * 1024; // base64 text; ~6 MB of JPEG

export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    // --- app-level auth ---------------------------------------------------
    const token = request.headers.get("X-App-Token") || "";
    if (!env.APP_TOKEN || !safeEqual(token, env.APP_TOKEN)) {
      return json({ error: "Unauthorized" }, 401);
    }

    // --- size guard -------------------------------------------------------
    const declared = Number(request.headers.get("Content-Length") || 0);
    if (declared > MAX_BODY_BYTES) {
      return json({ error: "Image too large" }, 413);
    }
    const body = await request.text();
    if (!body || body.length > MAX_BODY_BYTES) {
      return json({ error: "Missing or oversized image" }, 400);
    }

    // --- call Roboflow (header auth, key never in the query string) -------
    let upstream;
    try {
      upstream = await fetch(`https://serverless.roboflow.com/${env.MODEL_ID}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.ROBOFLOW_API_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });
    } catch (err) {
      console.error("Roboflow unreachable:", String(err));
      return json({ error: "Model API unreachable" }, 502);
    }

    if (!upstream.ok) {
      // Full detail goes to `wrangler tail`; the phone only sees the status.
      console.error("Roboflow error", upstream.status, (await upstream.text()).slice(0, 300));
      return json({ error: `Model API error ${upstream.status}` }, 502);
    }

    const result = await upstream.json();
    const threshold = parseFloat(env.CONFIDENCE) || 0.4;
    const predictions = Array.isArray(result.predictions) ? result.predictions : [];

    // Keep only confident detections with sane geometry. Roboflow reports
    // boxes as CENTER x/y plus width/height, in pixels of the image we sent.
    const kept = predictions.filter(
      (p) =>
        (p.confidence ?? 0) >= threshold &&
        [p.x, p.y, p.width, p.height].every((n) => Number.isFinite(n))
    );
    const boxes = kept.map((p) => ({
      x: p.x,
      y: p.y,
      width: p.width,
      height: p.height,
      confidence: p.confidence,
    }));

    // `count` is still returned so the v1 app (which only reads `count`)
    // keeps working against this same proxy. v2 reads `boxes` as well.
    return json({
      count: kept.length,
      detections: predictions.length,
      imageWidth: result.image?.width ?? null,
      imageHeight: result.image?.height ?? null,
      boxes,
    });
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Constant-time comparison so the token can't be guessed by timing.
function safeEqual(a, b) {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  if (x.byteLength !== y.byteLength) return false;
  return crypto.subtle.timingSafeEqual(x, y);
}
