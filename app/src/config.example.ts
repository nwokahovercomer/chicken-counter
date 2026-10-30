// Copy this file to config.ts and fill in your values. config.ts is git-ignored.
//
// APP_TOKEN is NOT a strong secret: anything compiled into an APK can be extracted.
// It only keeps casual traffic away from the proxy. Rotate it if a phone is lost
// (see docs/engineering/operations-runbook.md) and never attach the APK to a public release.
export const API_URL = "https://YOUR-PROXY.workers.dev/";
export const APP_TOKEN = "REPLACE_WITH_THE_SAME_VALUE_AS_THE_PROXY_APP_TOKEN_SECRET";
