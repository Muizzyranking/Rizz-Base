# Rizzbase

Rizzbase is a local-first database for Node.js. Each Project is one encrypted,
Brainrot-encoded `.rizz` file on your computer. There is no cloud service,
network database, account or realtime connection.

V1 includes the Go engine and CLI, a TypeScript/Node.js SDK, Lobby and Yap
operations, and simple in-memory Yap queries. The React product UI is a
Coming Soon preview; its screens use mock data and are not wired to the local
database engine.

## Install

```sh
npm install rizzbase
```

Requires Node.js 20 or newer. The first SDK operation downloads the matching
engine binary for macOS, Linux or Windows on x64 or arm64. Later calls use the
verified local cache. Downloads come from versioned GitHub releases and are
checked against the release's SHA-256 manifest.

The npm package and a matching `v1.0.0` GitHub release must both be published
before `npm install rizzbase` is available to the public. Until then, use the
SDK from this repository:

```sh
cd sdk
npm install
npm run build
npm test
```

## Quick start

```ts
import { Rizzbase } from "rizzbase";

const db = new Rizzbase("./my-project.rizz", "get-this-from-private-input");

// Create a new Project once; on later runs, open the existing Project instead.
await db.create("My project");
const lobby = await db.createLobby("general");
await db.createYap(lobby.id, "welcome", { message: "hello" });

const welcome = await db.getYap<{ message: string }>(lobby.id, "welcome");
const yaps = await db.query(lobby.id)
  .where("message", "==", "hello")
  .limit(10)
  .exec();

console.log(welcome.message, yaps.length);
```

`create()` does not overwrite an existing file. To use a Project in later runs,
construct the SDK with the same path and passphrase, then call `open()` or any
other operation. Read the [beginner-friendly guide and API reference](docs/SDK.md).

## Project vocabulary

- **Project**: one encrypted `.rizz` file. It holds its name, metadata and Lobbies.
- **Lobby**: a named group in a Project, with a generated ID and a set of Yaps.
- **Yap**: a JSON document with an ID you choose, stored inside a Lobby.

## Query example

Filters are AND-combined, dot-separated paths access nested object fields, and
the optional limit is applied after filtering. Results are sorted by Yap ID.
Queries read the Lobby into memory; V1 has no indexes or persisted query engine.

```ts
const active = await db.query("YOUR-LOBBY-ID")
  .where("user.active", "==", true)
  .where("score", ">=", 10)
  .limit(20)
  .exec();
```

Supported operators: `==`, `!=`, `>`, `>=`, `<`, `<=`. Equality compares JSON
values (including objects and arrays); ordering supports numbers and strings
only. A missing field does not match any operator. See [query details](docs/SDK.md#queries).

## Security and limits

- Choose a strong, unique passphrase and obtain it through private user input or
  a secrets manager. Do not commit, log, print, or place it in command-line
  arguments. The SDK sends it only to its local engine over stdin.
- Projects use AES-256-GCM with PBKDF2-HMAC-SHA256 at 600,000 iterations.
  Wrong passphrases and damaged ciphertext fail authentication. There is no
  passphrase recovery or key rotation.
- The SDK downloads a platform binary over HTTPS and validates its SHA-256
  against a versioned release manifest. Set `binaryPath` to use a build you
  obtained and trust yourself. Checksums detect corruption; they are not a
  signed provenance system.
- Keep secure backups of `.rizz` files. A local file lock blocks a second
  writer; after a crash, check that no process is still writing before manually
  removing its adjacent `.lock` directory.
- Each operation's JSON request is limited to 64 KiB; query results are
  bounded by the 64 MiB encoded-project file limit.
- This is local-only V1: no realtime, cloud storage, multi-user access, built-in
  backup, or UI connection. The Go API and CLI have their own documented limits.

## Develop this repository

```sh
cd engine
go test -race ./...
go vet ./...
cd ../sdk
npm install
npm test
npx tsc --noEmit --strict --target ES2022 --module Node16 \
  --moduleResolution Node16 --types node test/typecheck.ts
```

Go 1.24+ and Node.js 20+ are required. The SDK's tests build the local Go CLI
and exercise it using temporary encrypted projects. Binary releases build six
OS/architecture variants when a matching version tag is pushed; the current
SDK version expects `v1.0.0`.

See [SDK guide](docs/SDK.md), [file format and Go API](docs/FORMAT.md),
[contributing](CONTRIBUTING.md) and [security](SECURITY.md). Rizzbase is
licensed under the [MIT License](LICENSE).
