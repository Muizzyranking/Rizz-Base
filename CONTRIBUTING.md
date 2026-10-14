# Contributing

Rizzbase is being built one local-engine milestone at a time. Keep changes
focused on the Go engine until the TypeScript SDK and UI integration are
specifically in scope. Don't replace the imported React/Vite project.

## Before opening a pull request

```sh
cd engine
go test -race ./...
go vet ./...
```

Use `gofmt` on changed Go files. Add tests for both the expected operation and
failure cases. In particular, storage changes must not leak plaintext,
overwrite a project during create, leave partial files, or accept unauthenticated
data.

## Design constraints

- Keep V1 local-only and dependency-light.
- Never log, commit, or pass passphrases in process arguments.
- Never silently continue after encryption, validation, locking, or persistence
  failures.
- Preserve old project compatibility or explicitly version a breaking format.
- Don't make claims that Brainrot encoding provides security.
- Don't publish binaries or promise automatic SDK downloads without a real,
  verifiable release process.

## Pull request checklist

- Explain the user-visible behavior and any file-format implications.
- Include test results.
- Call out data migration or compatibility requirements.
- Don't include `.rizz` project data, generated binaries, secrets, or personal
  test data.
