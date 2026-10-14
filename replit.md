# Rizzbase project

The imported React/Vite interface stays in its original structure.
The user requested incremental development of a local Go database engine,
with a TypeScript SDK later, not deployment or UI setup.

## Current development commands

Go 1.24+ is required. The engine uses only the Go standard library.

- Tests: `cd engine && go test -race ./...`
- Static checks: `cd engine && go vet ./...`
- CLI: `cd engine && go run ./cmd/rizzbase < /path/to/private-request.json`

See README.md for create/open request fields, file-format details, and limitations.
No web/server workflow is needed for this CLI/library milestone.
Do not wire the imported UI to pretend database operations or use SESSION_SECRET
as an encryption key. Passphrases belong to individual projects and are passed
privately via stdin by callers.
