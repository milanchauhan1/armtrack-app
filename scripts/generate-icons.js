// Generates PWA icons as valid PNG files using only Node.js built-ins
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table
function makeCRCTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

const CRC_TABLE = makeCRCTable();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBuf, data]);
  const crc = crc32(crcInput);
  const out = Buffer.alloc(4 + 4 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  typeBuf.copy(out, 4);
  data.copy(out, 8);
  out.writeUInt32BE(crc, 8 + data.length);
  return out;
}

// Simple 5x9 bitmap font for capital letters A and T
// Each letter is represented as a flat array of 0/1 for a 5-column, 9-row grid
const GLYPHS = {
  A: [
    0,1,1,1,0,
    1,0,0,0,1,
    1,0,0,0,1,
    1,1,1,1,1,
    1,0,0,0,1,
    1,0,0,0,1,
    1,0,0,0,1,
    0,0,0,0,0,
    0,0,0,0,0,
  ],
  T: [
    1,1,1,1,1,
    0,0,1,0,0,
    0,0,1,0,0,
    0,0,1,0,0,
    0,0,1,0,0,
    0,0,1,0,0,
    0,0,1,0,0,
    0,0,0,0,0,
    0,0,0,0,0,
  ],
};

function createPNG(size) {
  const BG   = [0, 0, 0];       // black
  const BLUE = [59, 130, 246];  // #3B82F6
  const WHITE = [255, 255, 255];

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.42;

  // Glyph rendering params
  const glyphCols = 5;
  const glyphRows = 9;
  const scale = Math.max(1, Math.floor(size / 32)); // scale pixel size
  const letterSpacing = Math.floor(scale * 1.5);    // gap between A and T
  const totalW = (glyphCols * 2 + 1) * scale + letterSpacing; // 2 letters side-by-side
  const totalH = glyphRows * scale;
  const startX = Math.floor(cx - totalW / 2);
  const startY = Math.floor(cy - totalH / 2 - scale);

  // Build pixel map for "AT"
  const textPixels = new Set();

  for (const [li, letter] of ['A', 'T'].entries()) {
    const glyph = GLYPHS[letter];
    const offsetX = li * (glyphCols * scale + letterSpacing);
    for (let row = 0; row < glyphRows; row++) {
      for (let col = 0; col < glyphCols; col++) {
        if (glyph[row * glyphCols + col]) {
          for (let dy = 0; dy < scale; dy++) {
            for (let dx = 0; dx < scale; dx++) {
              const px = startX + offsetX + col * scale + dx;
              const py = startY + row * scale + dy;
              textPixels.add(`${px},${py}`);
            }
          }
        }
      }
    }
  }

  // Build raw scanline data
  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = [0]; // filter byte = None
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const inCircle = Math.sqrt(dx * dx + dy * dy) <= radius;
      const inText = textPixels.has(`${x},${y}`);
      if (inText) {
        row.push(...WHITE);
      } else if (inCircle) {
        row.push(...BLUE);
      } else {
        row.push(...BG);
      }
    }
    rows.push(Buffer.from(row));
  }

  const rawData = Buffer.concat(rows);
  const compressed = zlib.deflateSync(rawData, { level: 9 });

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type: RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

const outDir = path.join(__dirname, '../public/icons');
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, 'icon-192.png'), createPNG(192));
console.log('Created icon-192.png');

fs.writeFileSync(path.join(outDir, 'icon-512.png'), createPNG(512));
console.log('Created icon-512.png');
