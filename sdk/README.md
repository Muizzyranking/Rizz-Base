# Rizzbase SDK

Local-first encrypted Projects, Lobbies and Yaps for Node.js 20+.

```sh
npm install rizzbase
```

```ts
import { Rizzbase } from "rizzbase";

const db = new Rizzbase("./my-project.rizz", getPassphrasePrivately());
await db.open();

const lobby = await db.createLobby("general");
await db.createYap(lobby.id, "welcome", { message: "hello" });
const found = await db.query(lobby.id)
  .where("message", "==", "hello")
  .orderBy("message", "asc")
  .limit(10)
  .exec();

await db.export("./backup.json");
const restored = new Rizzbase("./restored.rizz", getPassphrasePrivately());
await restored.importBackup("./backup.json");
```

The first operation downloads and checksum-verifies the version-matched Go
engine for the current OS and CPU. A new Project is created with
`await db.create("Project name")`; `open()` opens an existing Project.

For the full API reference, query semantics, decrypted-backup safety, security
guidance and V1 limits, see the
[SDK guide](https://github.com/pazti/Rizz-Base/blob/main/docs/SDK.md). JSON
backups contain plaintext Project data: store them securely and never commit
them. Get private passphrases from your own secure input flow; never commit or
log them. This is a local file library, not a cloud or realtime database.
