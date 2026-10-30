# Setup and build

*Last reviewed: 2026-10-29 · Applies to: app 1.1.0 (Expo SDK 57), proxy, docs tooling*

## Prerequisites

| Tool | Used for |
|---|---|
| Git | Source control |
| Node.js LTS (22 is used for the tests) | App tooling, proxy tests, diagram validation |
| Python 3.12 or newer | Docs generator and checks |
| Free accounts: Expo, Cloudflare, Roboflow | Builds, proxy hosting, model access |
| An Android phone with **Expo Go for SDK 57** | Fast testing before a real build |

## 1. Proxy

```bash
cd proxy
node --test test/worker.test.mjs          # tests need no secrets
```

Set two secrets in Cloudflare (dashboard: Workers & Pages → your Worker → Settings → Variables and
Secrets), then deploy:

| Secret | Value |
|---|---|
| `ROBOFLOW_API_KEY` | A fresh Roboflow key |
| `APP_TOKEN` | A long random string (30+ characters) |

```bash
npx wrangler deploy            # or paste src/index.js into the dashboard's "Edit code"
```

Verify with the request in the [API reference](../architecture/api-reference.md#try-it).

## 2. App

```bash
cd app
npm install
cp src/config.example.ts src/config.ts      # then edit: proxy URL and the same APP_TOKEN
npx expo install expo-camera expo-image-picker expo-image-manipulator \
  expo-linear-gradient expo-font react-native-safe-area-context \
  @expo/vector-icons @react-native-async-storage/async-storage
npx expo start                              # scan the QR code with Expo Go
```

Always use `npx expo install` (not `npm install`) for Expo packages: it picks the versions that match the SDK.

## 3. Build an installable APK

`eas.json` (the `preview` profile must produce an APK, not the store bundle):

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "autoIncrement": true,
      "android": { "buildType": "apk" }
    }
  }
}
```

```bash
npx expo-doctor                                   # catch config problems before waiting in a build queue
eas build --platform android --profile preview
```

Installing and updating: [Distribution](distribution.md).

## 4. Documentation

From the repository root:

```bash
pip install -r requirements-docs.txt
python tools/check_docs.py        # links, nav, freshness
zensical serve                    # live preview at http://localhost:8000
```

How the docs are maintained: [Documentation system](../meta/documentation-system.md).

## Troubleshooting log

Real problems hit while building this project, with the fix that worked.

| Symptom | Cause | Fix |
|---|---|---|
| "Project is incompatible with this version of Expo Go" | Expo Go auto-updated to SDK 58; the project is on SDK 57 | Install Expo Go for SDK 57 from [expo.dev/go](https://expo.dev/go?sdkVersion=57&platform=android&device=true) and turn off its auto-update, or upgrade the project deliberately ([guide](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/)) |
| New project scaffolded on SDK 46 and failed to start | Stale tooling (most likely a global `expo-cli` or a cached `npx` package) | Uninstall global `expo-cli`, clear the npx cache, recreate with `npx create-expo-app@latest` |
| "Unable to resolve @expo/vector-icons" | Not installed in the project | `npx expo install @expo/vector-icons` |
| EAS "Run expo doctor" fails: missing peer dependency `expo-font` | Expo Go bundles it, which hid the gap | `npx expo install expo-font`; run `npx expo-doctor` locally first |
| Build produced a store bundle that cannot be installed | `preview` profile defaults to an app bundle | Add `"buildType": "apk"` ([Expo docs](https://docs.expo.dev/build-reference/apk/)) |
| Home icon changed but the splash screen did not | No `expo-splash-screen` entry in `app.json` plugins | Add the plugin pointing at `splash-icon.png`. Custom icon and splash never appear in Expo Go, only in a real build. |
| Android icon still showed the default logo | Newer template uses three adaptive-icon layers | Replace `android-icon-foreground`, `-background` and `-monochrome`, not just `icon.png` |
| `venv\Scripts\activate` blocked in PowerShell | Execution policy | `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` |
| `curl -H ...` errors in PowerShell | `curl` is an alias for `Invoke-WebRequest` | Use `curl.exe` |
| `wrangler login` fails with OAuth `request_forbidden` | Browser cookie or extension interference | Authenticate with a scoped API token in `CLOUDFLARE_API_TOKEN` instead |
| Wrangler error 9109 "Cannot use the access token from location" | The token had an IP allow-list | Remove the IP restriction or create a new token |
| Wrangler "No access to the specified service" / error 10000 | Token had the wrong permission (it could manage tokens, not Workers) | Create it from the "Edit Cloudflare Workers" template (Workers Scripts: Write) |
| "Invalid access token" right after `setx` | The open terminal or editor still has the old environment | Fully restart the editor and terminal; confirm with `wrangler whoami` |
| `wrangler secret put` failed with an API token (wrangler 4.143) | A CLI problem at that version | Set secrets in the Cloudflare dashboard instead |
| Roboflow returned 401 | A rotated key plus a hard-coded fallback to the old one, and the key in the query string | Header-only `Bearer` auth, a fresh key, and no fallback key ([ADR 0003](../decisions/0003-direct-rest-header-auth.md)) |
| `inference-sdk` would not install on Python 3.14 | No compatible build for that Python version | Call the REST endpoint directly ([ADR 0003](../decisions/0003-direct-rest-header-auth.md)) |

## Related

[Testing](testing.md) · [Distribution](distribution.md) · [Runbook](operations-runbook.md) · [Security](../architecture/security-and-privacy.md)
