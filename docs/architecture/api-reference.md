# Proxy API reference

*Last reviewed: 2026-10-29 · Applies to: proxy supporting app 1.1.0 and 1.0.0*

One endpoint. Machine-readable contract: [`openapi.yaml`](openapi.yaml) (OpenAPI 3.1).

## `POST /`

Detect chickens in one image.

| | |
|---|---|
| **URL** | The Worker URL (kept private; shown as `YOUR-PROXY` in these docs) |
| **Auth** | Header `X-App-Token: <shared token>` |
| **Content-Type** | `text/plain` |
| **Body** | The image as a raw **base64 string** (JPEG), at most 8 MB of text |

### Response `200`

```json
{
  "count": 3,
  "detections": 5,
  "imageWidth": 1600,
  "imageHeight": 1200,
  "boxes": [
    { "x": 100, "y": 200, "width": 40, "height": 50, "confidence": 0.91 }
  ]
}
```

| Field | Meaning |
|---|---|
| `count` | Number of detections at or above the confidence threshold |
| `detections` | Number of detections the model returned before the threshold |
| `imageWidth`, `imageHeight` | Size in pixels of the image the model received (may be `null`) |
| `boxes[].x`, `y` | Box **centre**, in pixels of that image |
| `boxes[].width`, `height` | Box size in pixels |
| `boxes[].confidence` | 0 to 1 |

Boxes with missing or non-numeric geometry are dropped.

### Errors

| Status | Body `error` | Cause |
|---|---|---|
| 400 | `Missing or oversized image` | Empty body, or body over the limit |
| 401 | `Unauthorized` | Missing or wrong `X-App-Token` |
| 405 | `Method not allowed` | Anything other than POST |
| 413 | `Image too large` | `Content-Length` over the limit |
| 502 | `Model API unreachable` / `Model API error <status>` | The model service failed. Details are logged in the Worker, never returned to the phone. |

## Configuration

| Name | Kind | Purpose |
|---|---|---|
| `MODEL_ID` | Variable | Roboflow model, for example `chicken-counting/5` |
| `CONFIDENCE` | Variable | Detections below this are dropped (default 0.4) |
| `ROBOFLOW_API_KEY` | Secret | Sent to the model as `Authorization: Bearer`, never in a URL |
| `APP_TOKEN` | Secret | The value the app must send |

Change procedures: [Runbook](../engineering/operations-runbook.md).

## Compatibility

v1 of the app reads only `count`. v2 reads `count` and `boxes`. The rule that keeps both working:
**fields may be added, never removed or renamed.** A breaking change would get a new route and a
decision record ([Decision log](../decisions/index.md)).

## Try it

```bash
# macOS / Linux
base64 -w0 photo.jpg > photo.b64
curl -X POST "https://YOUR-PROXY.workers.dev/" -H "X-App-Token: $APP_TOKEN" \
  -H "Content-Type: text/plain" --data-binary @photo.b64
```

```powershell
# Windows PowerShell (note curl.exe: plain "curl" is a different command there)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("photo.jpg")) | Set-Content -NoNewline photo.b64
curl.exe -X POST "https://YOUR-PROXY.workers.dev/" -H "X-App-Token: $env:APP_TOKEN" -H "Content-Type: text/plain" --data-binary "@photo.b64"
```

## Related

[Data flow](data-flow.md) · [Security and privacy](security-and-privacy.md) · [Testing](../engineering/testing.md) (AT-01 to AT-08 exercise this contract)
