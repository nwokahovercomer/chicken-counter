// Automated tests for the proxy. Run with:  node --test proxy/test/worker.test.mjs
// No network and no secrets: Roboflow is replaced by a fake `fetch`.
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

// Cloudflare Workers provide crypto.subtle.timingSafeEqual; Node does not. Test-only stand-in.
if (!crypto.subtle.timingSafeEqual) {
  crypto.subtle.timingSafeEqual = (a, b) => {
    const x = new Uint8Array(a), y = new Uint8Array(b);
    return x.length === y.length && x.every((v, i) => v === y[i]);
  };
}

const ENV = { APP_TOKEN: "secret", ROBOFLOW_API_KEY: "rf-key", MODEL_ID: "chicken-counting/5", CONFIDENCE: "0.4" };

const PREDICTIONS = {
  image: { width: 1600, height: 1200 },
  predictions: [
    { x: 100, y: 200, width: 40, height: 50, confidence: 0.91 },
    { x: 300, y: 400, width: 42, height: 48, confidence: 0.55 },
    { x: 500, y: 600, width: 38, height: 52, confidence: 0.41 },
    { x: 700, y: 800, width: 40, height: 50, confidence: 0.2 },  // below threshold -> dropped
    { x: null, y: 10, width: 40, height: 50, confidence: 0.95 }, // broken geometry -> dropped
  ],
};

const realFetch = globalThis.fetch;
let upstreamCalls;

beforeEach(() => {
  upstreamCalls = [];
  globalThis.fetch = async (url, init) => {
    upstreamCalls.push({ url: String(url), init });
    return new Response(JSON.stringify(PREDICTIONS), { status: 200 });
  };
});
afterEach(() => { globalThis.fetch = realFetch; });

const post = (headers = { "X-App-Token": "secret" }, body = "aW1hZ2U=", env = ENV) =>
  worker.fetch(new Request("https://proxy.test/", { method: "POST", headers, body }), env);

test("rejects anything that is not POST (405)", async () => {
  const res = await worker.fetch(new Request("https://proxy.test/", { method: "GET" }), ENV);
  assert.equal(res.status, 405);
});

test("rejects a missing or wrong app token (401) and never calls Roboflow", async () => {
  for (const headers of [{}, { "X-App-Token": "wrong" }]) {
    const res = await post(headers);
    assert.equal(res.status, 401);
  }
  assert.equal(upstreamCalls.length, 0);
});

test("rejects an oversized upload by Content-Length (413)", async () => {
  const res = await post({ "X-App-Token": "secret", "Content-Length": String(9 * 1024 * 1024) });
  assert.equal(res.status, 413);
  assert.equal(upstreamCalls.length, 0);
});

test("rejects an empty body (400)", async () => {
  const res = await post({ "X-App-Token": "secret" }, "");
  assert.equal(res.status, 400);
});

test("returns count, image size and boxes for confident, well-formed detections only", async () => {
  const res = await post();
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.count, 3);
  assert.equal(data.boxes.length, 3);
  assert.equal(data.imageWidth, 1600);
  assert.equal(data.imageHeight, 1200);
  assert.deepEqual(Object.keys(data.boxes[0]).sort(), ["confidence", "height", "width", "x", "y"]);
});

test("sends the Roboflow key only in the Authorization header, never in the URL", async () => {
  await post();
  assert.equal(upstreamCalls.length, 1);
  const { url, init } = upstreamCalls[0];
  assert.equal(url, "https://serverless.roboflow.com/chicken-counting/5");
  assert.equal(init.headers.Authorization, "Bearer rf-key");
  assert.ok(!url.includes("rf-key") && !url.includes("api_key"));
});

test("honours the CONFIDENCE setting", async () => {
  const res = await post({ "X-App-Token": "secret" }, "aW1hZ2U=", { ...ENV, CONFIDENCE: "0.9" });
  assert.equal((await res.json()).count, 1);
});

test("maps an upstream failure to 502 without leaking details", async () => {
  globalThis.fetch = async () => new Response("internal secret detail", { status: 500 });
  const res = await post();
  assert.equal(res.status, 502);
  assert.ok(!(await res.text()).includes("internal secret detail"));
});
