# Desktop prototype (archived)

The first working version: a Windows desktop app in Python (Dear PyGui) that counted chickens in
folders of three photos and combined the three counts with a rounded mean. It is kept for history;
the active product is the Android app. See [`docs/project/history.md`](../docs/project/history.md) and
[ADR 0004](../docs/decisions/0004-rounded-mean-voting.md) for why the approach changed.

```bash
pip install -r requirements.txt
setx ROBOFLOW_API_KEY "your-key"   # then open a new terminal
python main.py
```

Copy `main.py`, `voting.py` and `requirements.txt` from your working folder next to this file.
`model_client.py` here is the sanitized version: it reads the key from the environment only.
