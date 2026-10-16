# Node.js SDK

The only production SDK today. It wraps the engine binary: each method ensures a binary, spawns one engine process with your request on stdin, and resolves with the decoded result.

Requires **Node.js 20+** and a supported platform (Linux, macOS, Windows on x64/arm64). Unsupported platforms must supply `binaryPath`. This guide targets SDK `1.1.0` (`orderBy`, JSON export and restore included).

## Install

```sh
npm install rizzbase
```

Today's published package downloads the matching engine on first use into `~/.cache/rizzbase` and verifies SHA-256 against the release manifest. Part 2 changes this: you install the binary yourself (see Install page) and the SDK uses `PATH` / `binaryPath` without downloading.

## Quickstart

```ts
import { Rizzbase } from "rizzbase";

const db = new Rizzbase("./my-project.rizz", getPassphrasePrivately());

// First run only — refuses to overwrite:
await db.create("My project");

// Later runs, open instead:
// const project = await db.open();

const lobby = await db.createLobby("general");
await db.createYap(lobby.id, "welcome", { message: "hello" });

const welcome = await db.getYap<{ message: string }>(lobby.id, "welcome");
const yaps = await db.query(lobby.id)
  .where("message", "==", "hello")
  .limit(10)
  .exec();

console.log(welcome.message, yaps.length);
```

`getPassphrasePrivately()` is your code — a prompt or secrets manager. Never hardcode, log, or commit it.

Constructor:

```ts
new Rizzbase(path, passphrase, options?)
```

| Option | Default | Meaning |
| --- | --- | --- |
| `binaryPath` | engine on `PATH` / cache | Trusted executable; bypasses download |
| `cacheDir` | `~/.cache/rizzbase` | Where downloaded engines are cached |
| `binaryDownloadBaseUrl` | GitHub releases | HTTPS mirror with `v{version}/SHA256SUMS` layout |
| `timeoutMs` | `30000` | Per-engine-call timeout |

Relative paths resolve from `process.cwd()`. Operations on one instance are serialized in call order; a failed write does not poison the queue.

## API

All methods return Promises and reject with `RizzbaseError` (`code` + `message`, never includes the passphrase):

```ts
import { RizzbaseError } from "rizzbase";

try {
  await db.open();
} catch (error) {
  if (error instanceof RizzbaseError) console.error(error.code, error.message);
  throw error;
}
```

### Project

- `create(name): Promise<Project>` — new encrypted project; `FILE_EXISTS` if present.
- `open(): Promise<Project>` — decrypt + metadata.
- `export(backupPath): Promise<void>` — write a decrypted JSON snapshot; never overwrites, owner-only permissions, 64 MiB cap. The backup is sensitive plaintext.
- `importBackup(backupPath): Promise<Project>` — validate a JSON backup and encrypt it into this instance's new `.rizz` path. Bad backups reject with `INVALID_BACKUP`.

Backup paths must end in `.json` and differ from the project path:

```ts
await db.export("./backup.json");

const restored = new Rizzbase("./restored.rizz", getPassphrasePrivately());
await restored.importBackup("./backup.json");
```

For complete runnable apps, see the `examples/` folder in the repository (Notes and Todo).

### Lobby

- `createLobby(name): Promise<Lobby>` — generated `id` plus `name`, `createdAt`, `yaps`.
- `listLobbies(): Promise<Lobby[]>` — ID order.
- `deleteLobby(lobbyId): Promise<void>` — deletes Yaps too.

### Yap

- `createYap<T>(lobbyId, yapId, data): Promise<Yap<T>>`
- `getYap<T>(lobbyId, yapId): Promise<T>` — returns `data` only.
- `listYaps<T>(lobbyId): Promise<Yap<T>[]>` — Yap-ID order.
- `updateYap<T>(lobbyId, yapId, data): Promise<Yap<T>>` — full replace.
- `deleteYap(lobbyId, yapId): Promise<void>`

`Yap<T>` is `{ id, data }`. Pass plain JSON only — no cycles, no class instances, no symbol keys. Numbers must be finite.

### Queries

Options form:

```ts
await db.queryYaps("LOBBY-ID", {
  where: [
    { field: "user.active", operator: "==", value: true },
    { field: "score", operator: ">=", value: 10 },
  ],
  orderBy: { field: "score", direction: "desc" },
  limit: 20,
});
```

Builder form (immutable — each `where`/`orderBy`/`limit` returns a new query):

```ts
await db.query("LOBBY-ID")
  .where("user.active", "==", true)
  .where("score", ">=", 10)
  .orderBy("score", "desc")
  .limit(20)
  .exec();
```

`orderBy(field, direction)` takes `"asc"` (default) or `"desc"`. Numbers sort before strings; missing or non-number/string values sort last in either direction; ties fall back to Yap ID. Same semantics as the CLI: AND-combined, dot paths, six operators, missing field never matches, filter → order → limit.

### Error codes

`INVALID_ARGUMENT`, `UNSUPPORTED_PLATFORM`, `BINARY_DOWNLOAD_FAILED`, `BINARY_CHECKSUM_FAILED`, `BINARY_UNAVAILABLE`, `ENGINE_TIMEOUT`, `ENGINE_PROTOCOL_ERROR`, `ENGINE_ERROR`, plus engine codes `AUTHENTICATION_FAILED`, `INVALID_FORMAT`, `PROJECT_BUSY`, `LOBBY_NOT_FOUND`, `YAP_NOT_FOUND`, `YAP_EXISTS`, `FILE_NOT_FOUND`, `FILE_EXISTS`, `PERMISSION_DENIED`, `INVALID_BACKUP`, and SDK-side `EXPORT_FAILED`.

## Typing

```ts
import type { Project, Lobby, Yap, Filter, OrderBy, OrderDirection, QueryOptions, JsonValue } from "rizzbase";
```

`JsonValue` is the standard JSON union. Generics like `getYap<{ message: string }>` only affect TypeScript — the engine stores raw JSON.
