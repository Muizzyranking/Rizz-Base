# Rizzbase

A local-first database engine built around encrypted, Brainrot-encoded `.rizz`
project files. The engine is Go; a TypeScript/Node.js SDK is planned but not
implemented yet. The imported React/Vite UI remains separate and is not wired to
database operations.

## Current status

The first two engine milestones are implemented:

- Create and open version-1 projects.
- Create, list and delete Lobbies.
- Create, get, list, update and delete Yaps in a Lobby.
- AES-256-GCM authenticated encryption with PBKDF2-HMAC-SHA256 key derivation.
- A reversible Brainrot word encoding for the encrypted file envelope.
- Exclusive per-project write locks and atomic, full-file replacement.

Not implemented yet: `where` / `orderBy` / `limit` queries, optional schemas,
a TypeScript SDK, automatic binary downloads, realtime access or a UI connection.
Read [the file format and API details](docs/FORMAT.md) before relying on V1 files.

## Requirements

- Go 1.24 or newer
- No third-party Go dependencies

Run tests and checks:

```sh
cd engine
go test -race ./...
go vet ./...
```

Run the JSON CLI:

```sh
cd engine
go run ./cmd/rizzbase < /path/to/private-request.json
```

The CLI accepts one JSON request from stdin and prints one JSON response. It
never accepts a passphrase as a command-line argument. Use a private request
stream; don't commit request files or put real passphrases in shell history.

Supported `operation` values:

| Operation | Required fields besides `operation`, `path`, `passphrase` |
| --- | --- |
| `create` | `name` |
| `open` | — |
| `lobby.create` | `name` |
| `lobby.list` | — |
| `lobby.delete` | `lobbyId` |
| `yap.create` | `lobbyId`, `yapId`, JSON `data` |
| `yap.get` | `lobbyId`, `yapId` |
| `yap.list` | `lobbyId` |
| `yap.update` | `lobbyId`, `yapId`, JSON `data` |
| `yap.delete` | `lobbyId`, `yapId` |

Example request shapes (replace all example values; don't use these for real
data):

```json
{"operation":"create","path":"./demo.rizz","name":"demo","passphrase":"example-only"}
{"operation":"lobby.create","path":"./demo.rizz","name":"general","passphrase":"example-only"}
{"operation":"yap.create","path":"./demo.rizz","lobbyId":"<lobby-id>","yapId":"welcome","data":{"message":"hello"},"passphrase":"example-only"}
```

Each request is one CLI process invocation. The created Lobby response returns
its generated ID. Yaps support normal JSON values: strings, numbers, booleans,
objects/maps, arrays, and `null`. Project parent directories must already exist.
Project files are owner-only (0600) on Unix. Existing projects are never
overwritten by `create`.

## Go API

```go
package main

import (
	"fmt"

	"rizzbase/engine/core"
)

func run(passphrase string) error {
	project, err := core.CreateProject("./demo.rizz", "demo", passphrase)
	if err != nil {
		return err
	}
	lobby, err := core.CreateLobby("./demo.rizz", passphrase, "general")
	if err != nil {
		return err
	}
	if err := core.CreateYap("./demo.rizz", passphrase, lobby.ID, "welcome",
		map[string]any{"message": "hello"}); err != nil {
		return err
	}
	data, err := core.GetYap("./demo.rizz", passphrase, lobby.ID, "welcome")
	if err != nil {
		return err
	}
	fmt.Printf("%s: %s\n", project.Name, data)
	return nil
}
```

Get `passphrase` from your application's secure input. Don't hardcode it, print
it, or pass it in process arguments. The API is a local file library, not a
multi-user or network service.

## Atomic writes and recovery

Writers create a sibling `PROJECT.rizz.lock` directory before modifying the
project. A second writer fails rather than interleaving changes. Each update
reads and authenticates the existing file, applies the operation, writes and
syncs a complete encrypted temporary file in the same directory, then atomically
renames it over the old file. A failed validation does not publish a partial
change. This V1 uses single-file atomic replacement instead of a WAL.

If the process crashes, the file remains either the previous or fully written
version, but the lock directory can remain. **Before removing a `.lock`
directory, make sure every Rizzbase process using that project has stopped.**
Never remove a lock while a writer is active. There is no automatic stale-lock
recovery or multi-host coordination. Keep backups; there is not yet a backup or
restore command.

## Development

The project is intentionally implemented incrementally. See
[CONTRIBUTING.md](CONTRIBUTING.md) for scope and test guidance and
[SECURITY.md](SECURITY.md) for private-data and vulnerability-reporting guidance.
No software license has been chosen yet; ask the repository owner before
redistributing or treating the code as open source.
