# Rizzbase project

The imported React/Vite interface stays in its original structure. It is a
Coming Soon mockup, uses sample data, and is not connected to the local Go
engine or SDK. Do not present mock interactions as real database operations.

## Current development commands

Go 1.24+ is required. The engine uses only the Go standard library.

- Tests: `cd engine && go test -race ./...`
- Static checks: `cd engine && go vet ./...`
- CLI: `cd engine && go run ./cmd/rizzbase < /path/to/private-request.json`

See README.md for create/open request fields, file-format details, and limitations.
The UI preview runs with the `Start application` workflow on port 5000.
Do not wire the imported UI to pretend database operations or use SESSION_SECRET
as an encryption key. Passphrases belong to individual projects and are passed
privately via stdin by callers.
