---
name: Product scope
description: User-defined Rizzbase architecture and incremental delivery boundary
---

The user specified Go for the engine, TypeScript/Node.js for the SDK, local
file-based storage for V1, AES-256-GCM encryption, and custom Brainrot encoding.
Database = Project (one .rizz file), Collection = Lobby, Document = Yap.
V1 is local only; no realtime server.

**Why:** The user explicitly chose this architecture and asked: "not all at once
just step by step."

**How to apply:** Deliver one functional increment at a time rather than treating
the complete V1 list as permission to implement everything in one turn. Preserve
the imported UI until a step explicitly calls for connecting or changing it.
