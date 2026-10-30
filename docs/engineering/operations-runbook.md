# Operations runbook

*Last reviewed: 2026-10-29 · Applies to: proxy, app 1.1.0*

Step-by-step procedures. Commands assume you are in the `proxy/` folder unless stated.

## Health check

Send a real photo using [Try it](../architecture/api-reference.md#try-it). Expected: HTTP 200 with
`count` and `boxes`. A 401 means the token differs between app and proxy. A 502 means the model service failed (see [Logs](#read-the-proxy-logs)).

## Change the model

1. Confirm the new model is an **object-detection** model that returns `x`, `y`, `width`, `height`, `confidence` per prediction. If not, the proxy and app mapping must change first.
2. Edit `MODEL_ID` in `wrangler.toml` (for example `"workspace/model/3"`).
3. `npx wrangler deploy`. **No app rebuild or reinstall is needed.**
4. Run the [health check](#health-check) and a few real photos; compare with the old model.

> `wrangler.toml` is the source of truth. A value edited only in the Cloudflare dashboard is overwritten by the next deploy, so mirror any dashboard change into the file.

## Change the confidence threshold

Edit `CONFIDENCE` (0 to 1) in `wrangler.toml`, then `npx wrangler deploy`. Higher means fewer, surer boxes; lower means more boxes and more false positives. Tune it using the correction data in the app's list view ([Problem and goals](../overview/problem-and-goals.md#how-success-is-measured)).

## Rotate the app token

Do this after any suspected leak, or when a phone is lost.

1. Generate a new random value (30+ characters).
2. Set it as the `APP_TOKEN` secret in Cloudflare (dashboard, Variables and Secrets).
3. Put the same value in `app/src/config.ts`.
4. Bump the app version and rebuild: `eas build --platform android --profile preview`.
5. Reinstall on every phone. **Old installs get 401 from step 2 onward**, so do steps 2 to 5 together.

## Rotate the Roboflow key

1. Create a new key in the Roboflow dashboard.
2. Replace the `ROBOFLOW_API_KEY` secret in Cloudflare.
3. Revoke the old key. No app change is needed.

## Redeploy the proxy

`npx wrangler deploy`, or paste `src/index.js` into the dashboard's *Edit code* and deploy. Run `node --test test/worker.test.mjs` first.

## Read the proxy logs

`npx wrangler tail` streams live logs. Upstream errors show the model's status and a short message. Images are never logged.

## Lost or stolen phone

1. [Rotate the app token](#rotate-the-app-token) (this disables the lost phone's copy).
2. Reinstall the new build on the remaining phones.
3. Record it in the [risk register](../project/risks-fmea.md) if it changes any assessment (R-06).

## Release a new app version

- [ ] Tests pass; manual cases for the changes recorded in [Testing](testing.md#results-log)
- [ ] Version bumped in `app.json`; [changelog](../project/changelog.md) moved from *Unreleased* to the new version
- [ ] Docs updated per the [update triggers](../meta/documentation-system.md#update-triggers)
- [ ] `npx expo-doctor` clean; build with EAS; install and smoke-test one phone first
- [ ] Tag the commit (`v1.1.0`); roll out to the other phones

## Gotchas

- Environment variable changes (for example `setx`) apply only to **new** terminals: restart the editor too.
- Expo Go must match the project's SDK, or the QR code fails ([Troubleshooting](dev-setup-and-build.md#troubleshooting-log)).

## Related

[Security](../architecture/security-and-privacy.md) · [Distribution](distribution.md) · [API reference](../architecture/api-reference.md)
