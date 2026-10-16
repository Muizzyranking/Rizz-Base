import { randomUUID } from "node:crypto";
import { openExampleProject, promptSession, recordError } from "./common.mjs";

const input = promptSession();

try {
  const { db, lobby } = await openExampleProject("todos.rizz", "Todos", "todos");
  console.log(`Todos are stored in the encrypted Project at ${db.path}`);

  while (true) {
    const action = (await input.question("\n[a]dd  [l]ist open  [d]one  [q]uit > ")).trim().toLowerCase();
    if (action === "q") break;

    if (action === "a") {
      const title = (await input.question("Todo: ")).trim();
      if (!title) {
        console.log("A todo title is required.");
        continue;
      }
      const id = `todo-${Date.now()}-${randomUUID().slice(0, 8)}`;
      await db.createYap(lobby.id, id, { title, completed: false, createdAt: new Date().toISOString() });
      console.log(`Added ${id}.`);
      continue;
    }

    if (action === "l") {
      const todos = await db.query(lobby.id)
        .where("completed", "==", false)
        .orderBy("createdAt", "asc")
        .exec();
      if (!todos.length) {
        console.log("No open todos.");
        continue;
      }
      for (const todo of todos) console.log(`${todo.id}  ${todo.data.title}`);
      continue;
    }

    if (action === "d") {
      const id = (await input.question("Todo ID: ")).trim();
      const todo = await db.getYap(lobby.id, id);
      if (todo.completed) {
        console.log("That todo is already done.");
        continue;
      }
      await db.updateYap(lobby.id, id, { ...todo, completed: true, completedAt: new Date().toISOString() });
      console.log(`Completed ${id}.`);
      continue;
    }

    console.log("Choose a, l, d, or q.");
  }
} catch (error) {
  recordError(error);
} finally {
  input.close();
}
