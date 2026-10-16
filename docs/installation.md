# Install the engine binary

You do **not** need npm to run Rizzbase. Download the Go engine yourself, put it on your `PATH`, and every SDK talks to it. This is the Part 2 direction: the SDK stops downloading binaries, you own the binary.

Binaries live on versioned GitHub releases with a `SHA256SUMS` manifest
(current release: `v1.1.0`):

```text
https://github.com/pazti/Rizz-Base/releases/download/v1.1.0/<asset>
https://github.com/pazti/Rizz-Base/releases/download/v1.1.0/SHA256SUMS
```

## Pick your asset

| OS | Arch | Asset |
| --- | --- | --- |
| Linux | x64 | `rizzbase-linux-amd64` |
| Linux | arm64 | `rizzbase-linux-arm64` |
| macOS | x64 (Intel) | `rizzbase-darwin-amd64` |
| macOS | arm64 (Apple Silicon) | `rizzbase-darwin-arm64` |
| Windows | x64 | `rizzbase-windows-amd64.exe` |
| Windows | arm64 | `rizzbase-windows-arm64.exe` |

The SDK you use must match the release tag (today: `v1.1.0`).

## Linux

```sh
VERSION=1.1.0
ASSET=rizzbase-linux-amd64   # or rizzbase-linux-arm64
BASE=https://github.com/pazti/Rizz-Base/releases/download/v$VERSION

mkdir -p ~/.rizzbase/bin
curl -fL -o ~/.rizzbase/bin/rizzbase "$BASE/$ASSET"
curl -fL -o /tmp/SHA256SUMS "$BASE/SHA256SUMS"
cd ~/.rizzbase/bin && grep " $ASSET\$" /tmp/SHA256SUMS | sha256sum -c -
chmod +x ~/.rizzbase/bin/rizzbase
```

Add to `PATH` (pick your shell):

```sh
# ~/.bashrc or ~/.zshrc
export PATH="$HOME/.rizzbase/bin:$PATH"
```

Then `source ~/.bashrc` (or open a new terminal) and check:

```sh
echo '{"operation":"open","path":"x.rizz","passphrase":"y"}' | rizzbase || true
```

## macOS

```sh
VERSION=1.1.0
ASSET=rizzbase-darwin-arm64   # Apple Silicon; Intel uses rizzbase-darwin-amd64
BASE=https://github.com/pazti/Rizz-Base/releases/download/v$VERSION

mkdir -p ~/.rizzbase/bin
curl -fL -o ~/.rizzbase/bin/rizzbase "$BASE/$ASSET"
curl -fL -o /tmp/SHA256SUMS "$BASE/SHA256SUMS"
cd ~/.rizzbase/bin && grep " $ASSET\$" /tmp/SHA256SUMS | shasum -a 256 -c -
chmod +x ~/.rizzbase/bin/rizzbase
xattr -d com.apple.quarantine ~/.rizzbase/bin/rizzbase 2>/dev/null || true
```

Add to `PATH`:

```sh
# ~/.zshrc (default on modern macOS)
export PATH="$HOME/.rizzbase/bin:$PATH"
```

If macOS blocks the binary, open **System Settings → Privacy & Security** and allow it, or re-run the `xattr` line above.

## Windows (PowerShell)

```powershell
$Version = "1.1.0"
$Asset = "rizzbase-windows-amd64.exe"  # or rizzbase-windows-arm64.exe
$Base = "https://github.com/pazti/Rizz-Base/releases/download/v$Version"
$Dir = "$HOME\.rizzbase\bin"
New-Item -ItemType Directory -Force -Path $Dir | Out-Null
Invoke-WebRequest -Uri "$Base/$Asset" -OutFile "$Dir\rizzbase.exe"
Invoke-WebRequest -Uri "$Base/SHA256SUMS" -OutFile "$env:TEMP\SHA256SUMS"

# Verify checksum
$Expected = (Select-String -Path "$env:TEMP\SHA256SUMS" -Pattern $Asset).Line.Split()[0]
$Actual = (Get-FileHash "$Dir\rizzbase.exe" -Algorithm SHA256).Hash.ToLower()
if ($Expected -ne $Actual) { throw "Checksum mismatch" }
```

Add to `PATH` for the current user:

```powershell
$Path = [Environment]::GetEnvironmentVariable("Path", "User")
if ($Path -notlike "*\.rizzbase\bin*") {
  [Environment]::SetEnvironmentVariable("Path", "$Path;$Dir", "User")
}
# Open a NEW terminal, then:
rizzbase
```

> The binary takes no CLI flags. It reads one JSON request on stdin — see CLI reference.

## Build from source instead

Strongest supply-chain option. Requires Go 1.24+:

```sh
git clone https://github.com/pazti/Rizz-Base
cd Rizz-Base/engine
go build -o ~/.rizzbase/bin/rizzbase ./cmd/rizzbase
```

Point any SDK at it with `binaryPath`, or leave it on `PATH` so SDKs find it first.
