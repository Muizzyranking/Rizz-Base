import { Rizzbase, RizzbaseError, type JsonValue } from "../src/index.js";

async function example() {
  const db = new Rizzbase("./example.rizz", "private passphrase");
  await db.open();
  const lobby = await db.createLobby("general");
  await db.createYap(lobby.id, "welcome", { message: "hello" });
  const value = await db.getYap<{ message: string }>(lobby.id, "welcome");
  const results = await db.query(lobby.id)
    .where("message", "==", "hello")
    .orderBy("message", "asc")
    .limit(5)
    .exec();
  await db.export("./backup.json");
  const restored = new Rizzbase("./restored.rizz", "another private passphrase");
  await restored.importBackup("./backup.json");
  const arbitrary: JsonValue = { nested: [1, true, null] };
  void [value.message, results, arbitrary];
  try { await db.listYaps(lobby.id); }
  catch (error) {
    if (error instanceof RizzbaseError) console.error(error.code, error.message);
  }
}
void example;
