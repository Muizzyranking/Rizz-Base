const { execFileSync } = require("node:child_process");
const { mkdtemp, rm, writeFile } = require("node:fs/promises");
const { tmpdir } = require("node:os");
const { join } = require("node:path");
const { after, before, test } = require("node:test");
const assert = require("node:assert/strict");
const { Rizzbase, RizzbaseError } = require("../dist/index.js");
const { binaryAsset } = require("../dist/binary.js");
const { pathToFileURL } = require("node:url");

let directory;
let binary;
before(async () => {
  directory = await mkdtemp(join(tmpdir(), "rizzbase-sdk-"));
  binary = join(directory, "rizzbase");
  execFileSync("go", ["build", "-o", binary, "./cmd/rizzbase"], { cwd: join(__dirname, "../../engine") });
});
after(async () => rm(directory, { recursive: true, force: true }));

test("SDK covers project, Lobby, Yap and query operations", async () => {
  const path = join(directory, "demo.rizz");
  const db = new Rizzbase(path, "SDK test passphrase", { binaryPath: binary });
  assert.equal((await db.create("SDK test")).name, "SDK test");
  const lobby = await db.createLobby("general");
  await Promise.all([
    db.createYap(lobby.id, "one", { score: 2, user: { active: true } }),
    db.createYap(lobby.id, "two", { score: 5, user: { active: false } }),
    db.createYap(lobby.id, "three", { score: 8, user: { active: true } }),
  ]);
  assert.deepEqual(await db.getYap(lobby.id, "one"), { score: 2, user: { active: true } });
  assert.deepEqual((await db.listYaps(lobby.id)).map(y => y.id), ["one", "three", "two"]);
  assert.deepEqual((await db.query(lobby.id).where("score", ">=", 2).where("user.active", "==", true).limit(1).exec()).map(y => y.id), ["one"]);
  assert.deepEqual((await db.queryYaps(lobby.id, { where: [{ field: "score", operator: ">", value: 5 }] })).map(y => y.id), ["three"]);
  await db.updateYap(lobby.id, "one", { score: 3 });
  assert.deepEqual(await db.getYap(lobby.id, "one"), { score: 3 });
  assert.deepEqual((await db.listLobbies()).map(l => l.id), [lobby.id]);
  assert.equal((await db.open()).name, "SDK test");
  await db.deleteYap(lobby.id, "one");
  await db.deleteLobby(lobby.id);
  assert.deepEqual(await db.listLobbies(), []);
});

test("SDK reports typed engine and input errors without exposing passphrase", async () => {
  const path = join(directory, "errors.rizz");
  const db = new Rizzbase(path, "never-echo-this", { binaryPath: binary });
  await db.create("Errors");
  await assert.rejects(new Rizzbase(path, "wrong passphrase", { binaryPath: binary }).open(),
    e => e instanceof RizzbaseError && e.code === "AUTHENTICATION_FAILED" && !e.message.includes("wrong passphrase"));
  await assert.rejects(db.getYap("missing", "y"), e => e.code === "LOBBY_NOT_FOUND");
  assert.throws(() => new Rizzbase("missing.txt", "secret"), e => e.code === "INVALID_ARGUMENT");
  assert.throws(() => db.query("lobby").limit(-1), e => e.code === "INVALID_ARGUMENT");
  const circular = {}; circular.self = circular;
  await assert.rejects(db.createYap("lobby", "circular", circular), e => e.code === "INVALID_ARGUMENT");
  assert.equal((await (await import("node:fs/promises")).readFile(path, "utf8")).includes("never-echo-this"), false);
});

test("platform names map to all six supported builds", () => {
  for (const [platform, arch, expected] of [
    ["darwin", "arm64", "rizzbase-darwin-arm64"],
    ["darwin", "x64", "rizzbase-darwin-amd64"],
    ["linux", "arm64", "rizzbase-linux-arm64"],
    ["linux", "x64", "rizzbase-linux-amd64"],
    ["win32", "arm64", "rizzbase-windows-arm64.exe"],
    ["win32", "x64", "rizzbase-windows-amd64.exe"],
  ]) assert.equal(binaryAsset(platform, arch), expected);
  assert.throws(() => binaryAsset("freebsd", "x64"), e => e.code === "UNSUPPORTED_PLATFORM");
});

test("package supports named ES module imports", async () => {
  const imported = await import(pathToFileURL(join(__dirname, "../dist/index.js")));
  assert.equal(typeof imported.Rizzbase, "function");
  assert.equal(typeof imported.RizzbaseError, "function");
});

test("failed operations do not poison the instance queue", async () => {
  const db = new Rizzbase(join(directory, "queue.rizz"), "passphrase", { binaryPath: binary });
  await db.create("Queue");
  await assert.rejects(db.deleteLobby("does-not-exist"), e => e.code === "LOBBY_NOT_FOUND");
  assert.deepEqual(await db.listLobbies(), []);
});
