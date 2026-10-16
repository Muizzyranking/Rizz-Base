# SDKs in other languages

Only **Node.js** is production-ready today. Every future SDK is the same idea: own the engine binary, send one JSON request per operation on stdin, parse one JSON response on stdout. The CLI reference is the spec — SDKs add no new behavior.

## Status

| Language | Status | Notes |
| --- | --- | --- |
| Node.js / TypeScript | Stable (V1) | `npm install rizzbase`, see Node.js SDK page |
| Python | In progress (Part 2) | Mirrors the Node API; brings its own binary handling, no auto-download |
| Go | Engine-native | Import `rizzbase/engine/core` directly, no CLI hop needed |

> If you need Python today, shell out to the engine binary using the CLI page, or track this docs page — the Python SDK lands in Part 2.

## What a Python SDK will look like

Target API (mirrors Node 1:1 so examples translate):

```python
from rizzbase import Rizzbase

db = Rizzbase("./my-project.rizz", get_passphrase_privately())

# db.create("My project")   # first run only
# db.open()                  # later runs

lobby = db.create_lobby("general")
db.create_yap(lobby["id"], "welcome", {"message": "hello"})
welcome = db.get_yap(lobby["id"], "welcome")
yaps = db.query(lobby["id"]).where("message", "==", "hello").limit(10).exec()
```

Planned rules, same as Node:

- Constructor takes `(path, passphrase, binary_path=None, timeout_s=30)`.
- Binary resolution order: explicit `binary_path` → `RIZZBASE_BINARY` env → `PATH` → error with install instructions. No silent download.
- Errors raise `RizzbaseError` with stable `code` strings matching the CLI `errorCode` set.
- Queries validate locally (`field` dot-paths, six operators, non-negative integer limit) before spawning the engine.

## Build your own SDK in 20 minutes

1. Resolve the `rizzbase` executable (explicit path → env → `PATH`).
2. Serialize `{ operation, path, passphrase, ... }` to stdin (cap 64 KiB).
3. Spawn with no shell, no passphrase in argv/env, with a timeout.
4. Parse stdout JSON: `ok:true` → return payload key (`project/lobby/lobbies/yap/yaps/data`); `ok:false` → raise typed error from `errorCode`.
5. Validate JSON values client-side (plain data, finite numbers) so engine errors stay rare.

Any language that can spawn a process and speak JSON can be a first-class SDK.
