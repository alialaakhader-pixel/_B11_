import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, r, g, b) {
  // Simple uncompressed or deflate PNG builder
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type (truecolor)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw image data with scanlines (1 filter byte per line + RGB per pixel)
  const lineSize = 1 + width * 3;
  const rawData = Buffer.alloc(lineSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.38;

  for (let y = 0; y < height; y++) {
    const lineOffset = y * lineSize;
    rawData[lineOffset] = 0; // filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pxOffset = lineOffset + 1 + x * 3;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Outer stadium dark background
      let pr = 5, pg = 9, pb = 7;

      // Circle border in lime
      if (Math.abs(dist - radius) < width * 0.04) {
        pr = 203; pg = 251; pb = 99; // #cbfb63
      } else if (dist < radius * 0.5) {
        // Center football/pupil
        pr = 203; pg = 251; pb = 99;
      } else if (dist < radius) {
        pr = 10; pg = 25; pb = 15;
      }

      rawData[pxOffset] = pr;
      rawData[pxOffset + 1] = pg;
      rawData[pxOffset + 2] = pb;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressedData);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

// CRC32 implementation
function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c >>> 0;
  }

  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Generate icons
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192, 5, 9, 7));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512, 5, 9, 7));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, 5, 9, 7));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, 5, 9, 7));

console.log('PWA PNG icons generated successfully in public/');
