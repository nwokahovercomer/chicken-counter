# Proxy (Cloudflare Worker)

Holds the Roboflow API key so it never ships inside the phone app, checks a shared
app token, forwards one image to the model, and returns the count plus box coordinates.

- Source: [`src/index.js`](src/index.js) · Config: [`wrangler.toml`](wrangler.toml)
- Tests: `npm test` or `node --test test/worker.test.mjs` (no network, no secrets needed)
- API contract: [`docs/architecture/api-reference.md`](../docs/architecture/api-reference.md)
- Deploy and operate: [`docs/engineering/operations-runbook.md`](../docs/engineering/operations-runbook.md)

Secrets are set in Cloudflare (`ROBOFLOW_API_KEY`, `APP_TOKEN`), never in this folder.
