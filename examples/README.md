# Rizzbase examples

These small interactive Node.js apps demonstrate the SDK against local
encrypted Project files:

- [`notes.mjs`](./notes.mjs): add notes, list them, or search for an exact title.
- [`todos.mjs`](./todos.mjs): add, list, and complete todos.

## Run from this repository

The `1.1.0` SDK source is not published yet. Build the local SDK and engine:

```sh
cd sdk
npm install
npm run build
cd ../engine
go build -o /tmp/rizzbase-engine ./cmd/rizzbase
cd ..
```

Set a private passphrase and run either app. Do not put a real passphrase in
source code, command arguments, or shell history. Prefer your operating
system's secret manager. The prompt below reads it without echoing it into
terminal output or command history (Bash/Zsh):

```sh
read -rsp "Project passphrase: " RIZZBASE_PASSPHRASE
printf '\n'
export RIZZBASE_PASSPHRASE
export RIZZBASE_ENGINE_PATH=/tmp/rizzbase-engine
node examples/notes.mjs
# or
node examples/todos.mjs
```

By default, encrypted `.rizz` files are stored in
`~/.local/share/rizzbase/examples/`. Set `RIZZBASE_EXAMPLES_DIR` to use another
directory (for example, a temporary directory during testing). The examples
create their Projects on first run and reopen them on later runs. They do not
overwrite existing Project files.

The SDK also supports `db.export("./backup.json")` and
`db.importBackup("./backup.json")`. Exported JSON is decrypted plaintext and
must be protected.
