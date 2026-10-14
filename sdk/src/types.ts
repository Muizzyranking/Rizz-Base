export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type Operator = "==" | "!=" | ">" | ">=" | "<" | "<=";
export interface Yap<T = JsonValue> { id: string; data: T }
export interface Lobby {
  id: string;
  name: string;
  createdAt: string;
  yaps: Record<string, JsonValue>;
}
export interface Project {
  version: number;
  name: string;
  createdAt: string;
  lobbies: Record<string, Lobby>;
}
export interface Filter { field: string; operator: Operator; value: JsonValue }
export interface QueryOptions { where?: readonly Filter[]; limit?: number }
export interface RizzbaseOptions {
  /** Explicit trusted executable; bypasses all downloads. */
  binaryPath?: string;
  /** Defaults to ~/.cache/rizzbase. */
  cacheDir?: string;
  /** HTTPS release mirror containing v{version}/ assets. */
  binaryDownloadBaseUrl?: string;
  /** Per-process timeout, default 30 seconds. */
  timeoutMs?: number;
}
