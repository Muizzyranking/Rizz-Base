import { createHash, randomUUID } from "node:crypto";
import { chmod, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { RizzbaseError } from "./errors.js";
import type { RizzbaseOptions } from "./types.js";

// Must match the package version and GitHub release tag. No "latest" downloads.
export const ENGINE_VERSION = "1.0.0";
const RELEASES = "https://github.com/pazti/Rizz-Base/releases/download";
const pending = new Map<string, Promise<string>>();

export function binaryAsset(platform = process.platform, arch = process.arch): string {
  const os = { linux: "linux", darwin: "darwin", win32: "windows" }[platform as string];
  const cpu = { x64: "amd64", arm64: "arm64" }[arch as string];
  if (!os || !cpu) {
    throw new RizzbaseError(`Unsupported platform ${platform}/${arch}; use binaryPath with your own build.`, "UNSUPPORTED_PLATFORM");
  }
  return `rizzbase-${os}-${cpu}${platform === "win32" ? ".exe" : ""}`;
}

export async function ensureBinary(options: RizzbaseOptions): Promise<string> {
  if (options.binaryPath) return resolve(options.binaryPath);
  const asset = binaryAsset();
  const base = options.binaryDownloadBaseUrl ?? RELEASES;
  let url: URL;
  try { url = new URL(base); } catch {
    throw new RizzbaseError("Binary release URL must be an HTTPS URL.", "INVALID_ARGUMENT");
  }
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
    throw new RizzbaseError("Binary release URL must be HTTPS, without credentials, query or fragment.", "INVALID_ARGUMENT");
  }
  const source = createHash("sha256").update(base).digest("hex").slice(0, 16);
  const directory = join(options.cacheDir ?? join(homedir(), ".cache", "rizzbase"), ENGINE_VERSION, source);
  const destination = join(directory, asset);
  let job = pending.get(destination);
  if (!job) {
    job = download(base.replace(/\/$/, ""), directory, destination, asset);
    pending.set(destination, job);
    void job.finally(() => pending.delete(destination)).catch(() => {});
  }
  return job;
}

async function fetchBytes(url: string, maxSize: number): Promise<Buffer> {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000), redirect: "follow" });
  if (!response.ok || !response.body) throw new Error(`Release asset request failed (HTTP ${response.status}).`);
  if (response.url && new URL(response.url).protocol !== "https:") throw new Error("Insecure release redirect.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  const reader = response.body.getReader();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxSize) throw new Error("Release asset exceeds size limit.");
      chunks.push(value);
    }
  } finally { await reader.cancel(); }
  return Buffer.concat(chunks);
}

function sha256(data: Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

async function download(base: string, directory: string, destination: string, asset: string): Promise<string> {
  const checksumPath = `${destination}.sha256`;
  const temporary = `${destination}.${randomUUID()}.tmp`;
  const temporaryChecksum = `${temporary}.sha256`;
  try {
    // Offline reuse only after hashing the actual cached executable.
    try {
      const expected = (await readFile(checksumPath, "utf8")).trim();
      if (/^[a-f0-9]{64}$/.test(expected) && sha256(await readFile(destination)) === expected) return destination;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    const release = `${base}/v${ENGINE_VERSION}`;
    const manifest = (await fetchBytes(`${release}/SHA256SUMS`, 1 << 20)).toString("utf8");
    const matches = manifest.split(/\r?\n/).map(line => line.match(/^([a-fA-F0-9]{64})\s+\*?(\S+)$/))
      .filter(match => match?.[2] === asset);
    if (matches.length !== 1) throw new RizzbaseError(`Release has no unique checksum for ${asset}.`, "BINARY_CHECKSUM_FAILED");
    const expected = matches[0]![1]!.toLowerCase();
    const data = await fetchBytes(`${release}/${asset}`, 64 << 20);
    if (sha256(data) !== expected) throw new RizzbaseError("Downloaded engine checksum does not match.", "BINARY_CHECKSUM_FAILED");
    await mkdir(directory, { recursive: true, mode: 0o700 });
    await writeFile(temporary, data, { mode: 0o700, flag: "wx" });
    await chmod(temporary, 0o700);
    await writeFile(temporaryChecksum, expected, { mode: 0o600, flag: "wx" });
    await rename(temporary, destination);
    await rename(temporaryChecksum, checksumPath);
    return destination;
  } catch (error) {
    if (error instanceof RizzbaseError) throw error;
    throw new RizzbaseError(
      `Cannot obtain the Rizzbase v${ENGINE_VERSION} engine. Check release availability/network access or provide binaryPath.`,
      "BINARY_DOWNLOAD_FAILED", { cause: error },
    );
  } finally {
    await Promise.all([rm(temporary, { force: true }), rm(temporaryChecksum, { force: true })]);
  }
}
