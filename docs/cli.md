# CLI + engine reference

The `rizzbase` executable is the whole database. SDKs are thin wrappers around it. Learn this protocol and you can drive Rizzbase from any language.

## Calling convention

- No subcommands, no flags. Usage is exactly:
```text
rizzbase < request.json
```
- Extra argv is an error (exit 2).
- Reads **one** JSON object from stdin (max 64 KiB), writes **one** JSON object to stdout.
- One operation per process. Exit 0 on success, 1 on failure.
- Passphrase goes in the JSON body on stdin. Never as an argument.

## Request shape

```json
{
  "operation": "yap.create",
  "path": "./my-project.rizz",
  "passphrase": "obtain-privately",
  "lobbyId": "LOBBY-ID",
  "yapId": "welcome",
  "data": { "message": "hello" }
}
```

| Field | Required for | Notes |
| --- | --- | --- |
| `operation` | all | See table below |
| `path` | all | Must end in `.rizz` (SDK rule; engine accepts any path) |
| `passphrase` | all | Nonempty, private stdin only |
| `name` | `create`, `lobby.create` | Project or Lobby display name |
| `lobbyId` | `lobby.delete`, all `yap.*` | Generated Lobby ID |
| `yapId` | `yap.create/get/update/delete` | 1–128 bytes, caller-chosen |
| `data` | `yap.create`, `yap.update` | Valid JSON value |
| `query` | `yap.query` | `{ "where": [...], "limit": n }` |

Unknown fields are rejected.

## Operations

| Operation | Needs | Returns |
| --- | --- | --- |
| `create` | `name` | `{ ok:true, project }` — never overwrites an existing file |
| `open` | — | `{ ok:true, project }` — decrypt + metadata |
| `lobby.create` | `name` | `{ ok:true, lobby }` with generated `id` |
| `lobby.list` | — | `{ ok:true, lobbies }` sorted by ID |
| `lobby.delete` | `lobbyId` | `{ ok:true }` — deletes contained Yaps too |
| `yap.create` | `lobbyId`, `yapId`, `data` | `{ ok:true, yap:{id,data} }` — duplicate is an error |
| `yap.get` | `lobbyId`, `yapId` | `{ ok:true, data }` |
| `yap.list` | `lobbyId` | `{ ok:true, yaps }` sorted by Yap ID |
| `yap.update` | `lobbyId`, `yapId`, `data` | `{ ok:true, yap }` — full replace |
| `yap.delete` | `lobbyId`, `yapId` | `{ ok:true }` |
| `yap.query` | `lobbyId`, `query` | `{ ok:true, yaps }` filtered + limited |

Failure shape:

```json
{ "ok": false, "error": "human message", "errorCode": "YAP_NOT_FOUND" }
```

Error codes: `AUTHENTICATION_FAILED`, `INVALID_FORMAT`, `PROJECT_BUSY`, `LOBBY_NOT_FOUND`, `YAP_NOT_FOUND`, `YAP_EXISTS`, `FILE_NOT_FOUND`, `FILE_EXISTS`, `PERMISSION_DENIED`, `ENGINE_ERROR`.

## Examples

Create then write (each block is one process):

```sh
echo '{"operation":"create","path":"./demo.rizz","passphrase":"s3cret","name":"My project"}' | rizzbase
echo '{"operation":"lobby.create","path":"./demo.rizz","passphrase":"s3cret","name":"general"}' | rizzbase
```

Use `jq` to avoid leaking secrets into shell history files where possible, and prefer reading the passphrase from a prompt or file descriptor in scripts.

Query with two filters + limit:

```json
{
  "operation": "yap.query",
  "path": "./demo.rizz",
  "passphrase": "s3cret",
  "lobbyId": "LOBBY-ID",
  "query": {
    "where": [
      { "field": "user.active", "operator": "==", "value": true },
      { "field": "score", "operator": ">=", "value": 10 }
    ],
    "limit": 20
  }
}
```

Operators: `==`, `!=`, `>`, `>=`, `<`, `<=`. Filters are AND-combined. `field` uses dot-separated paths (`user.active`). Equality compares full JSON values (objects and arrays included). Ordering only compares number-vs-number or string-vs-string. Missing fields never match, including `!=`. Results sort by Yap ID, then the limit applies. The Lobby is scanned in memory; no indexes.

## Limits to design around

- Request body: 64 KiB. Large single `create`/`update` payloads are rejected.
- Encoded project file: 64 MiB.
- IDs: 1–128 bytes.
- Writes serialize on an adjacent `.lock` directory. A present lock blocks writes with `PROJECT_BUSY`. After a crash, verify no writer is alive before removing it.
- Writes are atomic rename after full sync; the old file stays intact until publish.
