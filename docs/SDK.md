# Rizzbase SDK guide

The SDK is a local Node.js wrapper around Rizzbase's Go engine. It never starts
a network database. It invokes the engine once per operation and stores data
in the `.rizz` file at the path you provide.

## Requirements and installation

- Node.js 20 or newer.
- A supported platform: Linux, macOS or Windows, x64 or arm64.
- For the published package, `npm install rizzbase`.

The first database operation downloads a version-specific engine executable
from the matching GitHub release. The downloader requires HTTPS, checks the
engine against that release's SHA-256 manifest, and stores the executable in
`~/.cache/rizzbase` (or the directory supplied as `cacheDir`). It rechecks the
cached executable before reuse. Network access is needed for the first
download; subsequent runs can work offline if the verified cache remains.
Unsupported platforms can use a trusted, locally built binary through
`binaryPath`.

## Quick start

```ts
import { Rizzbase } from "rizzbase";

const db = new Rizzbase("./my-project.rizz", getPassphrasePrivately());

// First run only:
await db.create("My project");

// On a later run, use this instead:
// const project = await db.open();

const lobby = await db.createLobby("general");
await db.createYap(lobby.id, "welcome", { message: "hello" });
const welcome = await db.getYap<{ message: string }>(lobby.id, "welcome");

console.log(welcome.message);
```

`getPassphrasePrivately()` above stands for your own secure input flow; it is
not part of the SDK. `create()` refuses to replace an existing project. Keep
the same passphrase to open it later. You can use other SDK operations directly
after constructing an instance; they read the existing project.

The SDK constructor is `new Rizzbase(path, passphrase, options?)`. Relative
paths resolve from the current working directory.

### Options

```ts
new Rizzbase("./data.rizz", passphrase, {
  binaryPath: "/trusted/path/to/rizzbase", // optional; bypasses download
  cacheDir: "/private/user/cache",         // optional; default ~/.cache/rizzbase
  timeoutMs: 30_000,                       // optional; per engine call
});
```

`binaryDownloadBaseUrl` can point at an HTTPS release mirror following the
`v{version}/SHA256SUMS` and `v{version}/{asset}` layout. It cannot use HTTP or
URLs with embedded credentials, queries or fragments.

## API reference

All database methods return Promises. Failures reject with `RizzbaseError`,
which has a stable `code` and a human-readable `message`. It does not include
the passphrase. Handle it with:

```ts
import { RizzbaseError } from "rizzbase";

try {
  await db.open();
} catch (error) {
  if (error instanceof RizzbaseError) {
    console.error(error.code, error.message);
  }
  throw error;
}
```

### Project

- `new Rizzbase(path, passphrase, options?)`: create a local SDK instance.
- `create(name): Promise<Project>`: create a new encrypted project; never
  overwrites an existing file.
- `open(): Promise<Project>`: decrypt and return the Project metadata.

### Lobby

- `createLobby(name): Promise<Lobby>`: add a Lobby; its `id` is generated.
- `listLobbies(): Promise<Lobby[]>`: list Lobbies in ID order.
- `deleteLobby(lobbyId): Promise<void>`: delete a Lobby and all its Yaps.

### Yap

- `createYap<T extends JsonValue>(lobbyId, yapId, data): Promise<Yap<T>>`:
  create a JSON document. IDs are caller-supplied, 1–128 bytes.
- `getYap<T = JsonValue>(lobbyId, yapId): Promise<T>`: return document data.
- `listYaps<T = JsonValue>(lobbyId): Promise<Yap<T>[]>`: list records in Yap-ID order.
- `updateYap<T extends JsonValue>(lobbyId, yapId, data): Promise<Yap<T>>`:
  replace the entire document.
- `deleteYap(lobbyId, yapId): Promise<void>`: delete a Yap.

`Yap<T>` is `{ id: string; data: T }`. `Lobby` includes `id`, `name`,
`createdAt` and `yaps`; `Project` includes `version`, `name`, `createdAt` and
`lobbies`. Pass plain JSON-compatible values (objects, arrays, strings,
numbers, booleans and `null`), not cyclic values or class instances.

### Queries

Run an options query:

```ts
const results = await db.queryYaps("LOBBY-ID", {
  where: [
    { field: "user.active", operator: "==", value: true },
    { field: "score", operator: ">=", value: 10 },
  ],
  limit: 20,
});
```

Or use the immutable query builder:

```ts
const results = await db.query("LOBBY-ID")
  .where("user.active", "==", true)
  .where("score", ">=", 10)
  .limit(20)
  .exec();
```

Operators are `==`, `!=`, `>`, `>=`, `<` and `<=`. Multiple filters are ANDed.
Use dot-separated paths for nested JSON object fields. All six comparisons
support JSON equality for primitives, arrays and objects. Ordering applies
only to values where both sides are numbers or both are strings; it never
coerces types. Missing fields never match (including `!=`). A limit is a
non-negative safe integer and is applied after filtering. Results are sorted by
Yap ID before a limit is applied. Queries decrypt and scan the Lobby in memory;
there are no indexes, joins, sorting options or query plans in V1.

## Project / Lobby / Yap

Think of one `.rizz` Project as the database file. Lobbies group related records
inside it (for example `users` or `messages`). Each Yap is a JSON document with
a unique ID within its Lobby. Lobbies receive generated IDs; the app chooses
Yap IDs. Deleting a Lobby also deletes all Yaps inside it.

## Brainrot encoding and encryption

The encrypted binary file is encoded into pairs of words from a fixed,
versioned vocabulary. Encoding is only a reversible representation; it is not
encryption and does not make data private. AES-256-GCM protects the contents
and detects tampering. A random salt and nonce are used, and PBKDF2-HMAC-SHA256
derives the encryption key from the passphrase (600,000 iterations). File
format details are in [FORMAT.md](FORMAT.md).

## Passphrase and file safety

- Obtain passphrases from a private prompt or secure secret store. Never
  hardcode, commit, print or log them, and never put them in CLI arguments.
- The local SDK sends the passphrase over the child process's stdin. It is not
  put in the process arguments or environment. Do not expose the SDK through
  an untrusted server endpoint.
- There is no recovery if the passphrase is lost. Keep secure backups.
- Projects are local files with a 64 MiB encoded-file limit and owner-only
  permissions on Unix. Project writes use an adjacent lock; concurrent writers
  fail rather than overwrite each other. Check for an active process before
  manually clearing a lock left after a crash.
- Each request sent to the engine is limited to 64 KiB, so a single
  create/update with a larger JSON value is rejected. Query responses are
  bounded separately by the engine's project file-size limit.
- Downloads use HTTPS and verify a SHA-256 checksum delivered with the release.
  The manifest is not a cryptographic signature or independent proof of who
  published the binary. For a stronger supply-chain policy, build and audit
  the Go binary yourself, then configure `binaryPath`.
- Do not put `.rizz` files, passphrases, or real private data in source control.

## V1 boundaries

Rizzbase is local-only. It does not provide a server, realtime or multi-user
features, account management, remote backups, schema enforcement, or indexes.
The React UI in this repository is not wired to the engine. For the Go API,
CLI request protocol, file-size limit and atomic write details, see
[FORMAT.md](FORMAT.md).
