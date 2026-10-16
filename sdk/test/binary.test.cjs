const { createHash } = require("node:crypto");
const { mkdtemp, readFile, rm } = require("node:fs/promises");
const { tmpdir } = require("node:os");
const { join } = require("node:path");
const { afterEach, test } = require("node:test");
const assert = require("node:assert/strict");
const { ensureBinary } = require("../dist/binary.js");

const root = "https://releases.example.invalid";
const asset = `rizzbase-${process.platform}-${process.arch === "x64" ? "amd64" : process.arch}${process.platform === "win32" ? ".exe" : ""}`;
const directories = [];
const originalFetch = global.fetch;
afterEach(async () => {
  global.fetch = originalFetch;
  await Promise.all(directories.splice(0).map(path => rm(path, { recursive: true, force: true })));
});

test("downloads only the manifest-pinned checksum and reuses verified cache", async () => {
  const cacheDir = await mkdtemp(join(tmpdir(), "rizz-cache-"));
  directories.push(cacheDir);
  const executable = Buffer.from("test executable contents");
  const checksum = createHash("sha256").update(executable).digest("hex");
  const calls = [];
  global.fetch = async (url) => {
    calls.push(String(url));
    const contents = String(url).endsWith("/SHA256SUMS") ? `${checksum}  ${asset}\n` : executable;
    return new Response(contents, { status: 200 });
  };
  const options = { cacheDir, binaryDownloadBaseUrl: root };
  const path = await ensureBinary(options);
  assert.deepEqual(await readFile(path), executable);
  assert.equal(calls.length, 2);
  assert.equal(await ensureBinary(options), path);
  assert.equal(calls.length, 2);
  const { writeFile } = require("node:fs/promises");
  await writeFile(path, "tampered cached executable");
  assert.equal(await ensureBinary(options), path);
  assert.deepEqual(await readFile(path), executable);
  assert.equal(calls.length, 4);
});

test("rejects a binary whose bytes do not match its release checksum", async () => {
  const cacheDir = await mkdtemp(join(tmpdir(), "rizz-cache-"));
  directories.push(cacheDir);
  const calls = [];
  global.fetch = async (url) => {
    calls.push(String(url));
    return new Response(String(url).endsWith("/SHA256SUMS") ? `${"0".repeat(64)}  ${asset}\n` : "tampered", { status: 200 });
  };
  await assert.rejects(ensureBinary({ cacheDir, binaryDownloadBaseUrl: root }), e => e.code === "BINARY_CHECKSUM_FAILED");
  assert.equal(calls.length, 2);
});

test("rejects non-HTTPS mirrors", async () => {
  await assert.rejects(ensureBinary({ binaryDownloadBaseUrl: "http://insecure.example" }), e => e.code === "INVALID_ARGUMENT");
});
