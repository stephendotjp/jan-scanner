import { deflateSync } from 'zlib';
import { writeFileSync } from 'fs';

function crc32(buf) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (const b of buf) crc = table[(crc ^ b) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function pngChunk(type, data) {
  const t = Buffer.from(type);
  const len = Buffer.allocUnsafe(4);
  len.writeUInt32BE(data.length);
  const crc = Buffer.allocUnsafe(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

function makePNG(size, drawFn) {
  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const stride = 1 + size * 3;
  const raw = Buffer.alloc(size * stride);

  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const [r, g, b] = drawFn(x / size, y / size);
      const i = y * stride + 1 + x * 3;
      raw[i] = r; raw[i + 1] = g; raw[i + 2] = b;
    }
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// Dark navy background with gold barcode stripes
const draw = (cx, cy) => {
  const bg = [26, 26, 46];   // #1a1a2e
  const gold = [255, 200, 0]; // #ffc800
  const pad = 0.18;

  // Vertical barcode stripes in the middle band
  const inBand = cy > 0.28 && cy < 0.74;
  const inH = cx > pad && cx < 1 - pad;

  if (inBand && inH) {
    const bars = [0.1, 0.18, 0.26, 0.31, 0.42, 0.47, 0.56, 0.63, 0.72, 0.78, 0.86, 0.91];
    const rel = (cx - pad) / (1 - 2 * pad);
    for (let i = 0; i < bars.length; i += 2) {
      if (rel >= bars[i] && rel <= bars[i + 1]) return gold;
    }
  }

  // "JAN" label block under stripes
  if (cy > 0.77 && cy < 0.87 && cx > pad + 0.05 && cx < 1 - pad - 0.05) {
    return gold;
  }

  return bg;
};

writeFileSync('public/icon-192.png', makePNG(192, draw));
writeFileSync('public/icon-512.png', makePNG(512, draw));
console.log('Icons written to public/');
