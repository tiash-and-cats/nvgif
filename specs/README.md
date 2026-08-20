# NVGIF Specification

This section documents the technical specifications of NVGIF across versions. Here you’ll find details on compression schemes, alpha channel handling, and encoding formats, version by version.

## Format Specifications

- [NVGIF v1–v3](v123.md): The early days. Minimal headers, row-based RLE, and the debut of alpha support in v3.
- [NVGIF v4](v4.md): Introduces per-row hybrid compression using RLE+Zlib.
- [NVGIF v5](v5.md): Adds batch RLE and bitmasks for compression, as well as RGB565 lossy compression.
- [NVGIF v6](v6.md): Adds error checking via CRC32.

## Version identification

All NVGIF files declare their version in a fixed position within the header:

| Offset | Field | Description |
|----|----|----|
| 0–2 | Magic | Always "NVG" |
| 3 | Version | Format version (1–6) |
| 4+ | Payload | Version-specific header/data |

Because the version byte is always at offset 3, older decoders can reliably detect when they encounter a newer file. For example, a v1-only decoder will correctly identify a v2 or v4 file as unsupported, instead of misreading or crashing, since it can inspect the version byte early and bail out gracefully. This makes NVGIF intentionally incompatible but safely recognizable across versions, ensuring both forwards- and backwards-facing tools fail predictably, not silently.