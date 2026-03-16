# NVGIF Specification

**NVGIF (Not Very Good Image Format)** is a compact, versioned image format designed for simplicity, modularity, and offline experimentation. What started as a joke name became a flexible spec with alpha support and per-row compression.

NVGIF doesn’t aim to be a universal format. It aims to be *yours*. And it shall always remain **Not Very Good**, proudly and permanently.

## 📄 Format Specifications

- [NVGIF v1–v3](v123.md): The early days. Minimal headers, row-based RLE, and the debut of alpha support in v3.
- [NVGIF v4](v4.md): Introduces per-row hybrid compression using RLE_Zlib and refined extensibility.
- [NVGIF v5](v5.md): Introduces batch RLE and bitmasks for compression, as well as RGB565 lossy compression.

### 🔍 Version identification

All NVGIF files declare their version in a fixed position within the header:

| Offset  | Field      | Description                   |
|---------|------------|-------------------------------|
| 0–2     | Magic      | Always "NVG" |
| 3       | Version    | Format version (1–4) |
| 4+      | Payload    | Version-specific header/data |

Because the version byte is always at offset **3**, older decoders can reliably detect when they encounter a newer file. For example, a v1-only decoder will correctly identify a v2 or v4 file as unsupported—instead of misreading or crashing—since it can inspect the version byte early and bail out gracefully.

> 🔒 This makes NVGIF *intentionally incompatible but safely recognizable* across versions—ensuring forwards- and backwards-facing tools fail predictably, not silently.