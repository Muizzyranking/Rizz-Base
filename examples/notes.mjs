import { randomUUID } from "node:crypto";
import { openExampleProject, promptSession, recordError } from "./common.mjs";

const input = promptSession();

try {
  const { db, lobby } = await openExampleProject("notes.rizz", "Notes", "notes");
  console.log(`Notes are stored in the encrypted Project at ${db.path}`);

  while (true) {
    const action = (await input.question("\n[a]dd  [l]ist  [s]earch title  [q]uit > ")).trim().toLowerCase();
    if (action === "q") break;

    if (action === "a") {
      const title = (await input.question("Title: ")).trim();
      const body = (await input.question("Note: ")).trim();
      if (!title || !body) {
        console.log("A title and note body are both required.");
        continue;
      }
      const id = `note-${Date.now()}-${randomUUID().slice(0, 8)}`;
      const now = new Date().toISOString();
      await db.createYap(lobby.id, id, { title, body, createdAt: now });
      console.log(`Saved note ${id}.`);
      continue;
    }

    if (action === "l" || action === "s") {
      const where = action === "s"
        ? [{ field: "title", operator: "==", value: (await input.question("Exact title: ")).trim() }]
        : undefined;
      const notes = await db.queryYaps(lobby.id, {
        ...(where ? { where } : {}),
        orderBy: { field: "createdAt", direction: "desc" },
      });
      if (!notes.length) {
        console.log("No matching notes yet.");
        continue;
      }
      for (const note of notes) console.log(`\n${note.id} — ${note.data.title}\n${note.data.body}`);
      continue;
    }

    console.log("Choose a, l, s, or q.");
  }
} catch (error) {
  recordError(error);
} finally {
  input.close();
}
