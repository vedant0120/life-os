// One-shot icon generator. Emits solid-bg PNGs with a centered letter "L".
// No image deps — uses Node's zlib + a minimal 5x7 bitmap font.
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const BG = [0x0a, 0x0a, 0x0f] // #0a0a0f
const FG = [0x81, 0x8c, 0xf8] // #818cf8

// 5x7 bitmap for the letter "L"
const GLYPH_L = [
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [1, 1, 1, 1, 1],
]

function crc32(buf) {
  let c
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function makePng(size) {
  // scale the 5x7 glyph so it occupies ~55% of canvas, centered
  const glyphH = GLYPH_L.length // 7
  const glyphW = GLYPH_L[0].length // 5
  const scale = Math.floor((size * 0.55) / glyphH)
  const drawW = glyphW * scale
  const drawH = glyphH * scale
  const offX = Math.floor((size - drawW) / 2)
  const offY = Math.floor((size - drawH) / 2)

  // row filter byte (0) + RGB bytes per row
  const raw = Buffer.alloc(size * (1 + size * 3))
  for (let y = 0; y < size; y++) {
    const rowStart = y * (1 + size * 3)
    raw[rowStart] = 0 // filter: None
    for (let x = 0; x < size; x++) {
      let c = BG
      const gx = Math.floor((x - offX) / scale)
      const gy = Math.floor((y - offY) / scale)
      if (gx >= 0 && gx < glyphW && gy >= 0 && gy < glyphH && GLYPH_L[gy][gx]) c = FG
      const p = rowStart + 1 + x * 3
      raw[p] = c[0]
      raw[p + 1] = c[1]
      raw[p + 2] = c[2]
    }
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // color type: RGB
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

for (const size of [192, 512]) {
  const out = `public/pwa-${size}.png`
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, makePng(size))
  console.log(`wrote ${out} (${size}x${size})`)
}
