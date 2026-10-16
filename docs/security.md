# Security and limits

Rizzbase protects a file on your device. It does not protect you from yourself — read this once.

## Passphrase

- Choose a strong, unique passphrase. Get it from private input or a secrets manager.
- Never commit, log, print, or put it in CLI arguments. The SDK and CLI send it on stdin only.
- Do not expose the SDK through an untrusted server endpoint.
- There is **no recovery and no key rotation**. Lose it and the file is unreadable.

## Encryption

- AES-256-GCM with PBKDF2-HMAC-SHA256 at 600,000 iterations, random 16-byte salt + 12-byte nonce per write.
- The header (version, salt, nonce, size) is public. Everything else is ciphertext + auth tag.
- Wrong passphrases and damaged ciphertext both fail authentication — by design you cannot tell them apart.
- Brainrot word-pair encoding is only a reversible representation. It adds zero secrecy.

## Files and locks

- One Project is one `.rizz` file, max 64 MiB encoded. Keep secure backups yourself.
- Owner-only permissions on Unix. Never check `.rizz` files or passphrases into git.
- Writes serialize on an adjacent `.lock` directory. A present lock returns `PROJECT_BUSY` instead of overwriting.
- After a crash, confirm no writer process is alive before manually removing a stale `.lock` directory.
- New bytes are fully written + synced before atomic rename. The old file survives until publish. Network filesystems without atomic same-directory rename are unsupported.

## Supply chain

- Manual installs verify SHA-256 against the release `SHA256SUMS`. That detects corruption, not authorship — it is not a signature.
- Strongest policy: `go build` the engine yourself and set `binaryPath` to your build.
- Each engine request is capped at 64 KiB; query responses are bounded by the project file limit.

## V1 boundaries (non-negotiable)

Local-only. No server, realtime, multi-user, accounts, remote backup, schema enforcement, indexes, joins, or UI connection. The React screens on this site are mockups with sample data.
