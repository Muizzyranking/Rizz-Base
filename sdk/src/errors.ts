export type ErrorCode =
  | "INVALID_ARGUMENT" | "UNSUPPORTED_PLATFORM" | "BINARY_DOWNLOAD_FAILED"
  | "BINARY_CHECKSUM_FAILED" | "BINARY_UNAVAILABLE" | "ENGINE_TIMEOUT"
  | "ENGINE_PROTOCOL_ERROR" | "ENGINE_ERROR" | "AUTHENTICATION_FAILED"
  | "INVALID_FORMAT" | "PROJECT_BUSY" | "LOBBY_NOT_FOUND" | "YAP_NOT_FOUND"
  | "YAP_EXISTS" | "FILE_NOT_FOUND" | "FILE_EXISTS" | "PERMISSION_DENIED";

export class RizzbaseError extends Error {
  constructor(message: string, public readonly code: ErrorCode, options?: ErrorOptions) {
    super(message, options);
    this.name = "RizzbaseError";
  }
}
