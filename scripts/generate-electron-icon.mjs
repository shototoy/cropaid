import sharp from 'sharp';
import { writeFile } from 'fs/promises';
import path from 'path';

const sourcePng = path.join(process.cwd(), 'public', 'icons', 'icon-512x512.png');
const outIco = path.join(process.cwd(), 'icon.ico');

// ICO files can contain multiple images. Use BMP/DIB payloads for maximum tool compatibility (e.g. NSIS).
// 256px is the max size for Windows icons.
const sizes = [16, 32, 48, 64, 128, 256];

function rgbaToBgraBottomUp(rgba, size) {
  const rowBytes = size * 4;
  const out = Buffer.alloc(rgba.length);

  for (let y = 0; y < size; y++) {
    const srcRow = y * rowBytes;
    const dstRow = (size - 1 - y) * rowBytes;
    for (let x = 0; x < size; x++) {
      const src = srcRow + x * 4;
      const dst = dstRow + x * 4;
      const r = rgba[src + 0];
      const g = rgba[src + 1];
      const b = rgba[src + 2];
      const a = rgba[src + 3];
      out[dst + 0] = b;
      out[dst + 1] = g;
      out[dst + 2] = r;
      out[dst + 3] = a;
    }
  }

  return out;
}

function dib32FromRgba(size, rgba) {
  const bgra = rgbaToBgraBottomUp(rgba, size);

  // AND mask: 1 bit per pixel, rows padded to 32-bit boundaries (4 bytes).
  const maskRowBytes = Math.ceil(size / 32) * 4;
  const mask = Buffer.alloc(maskRowBytes * size, 0x00);

  // BITMAPINFOHEADER (40 bytes). Height is doubled to include the mask.
  const header = Buffer.alloc(40);
  header.writeUInt32LE(40, 0); // biSize
  header.writeInt32LE(size, 4); // biWidth
  header.writeInt32LE(size * 2, 8); // biHeight (color + mask)
  header.writeUInt16LE(1, 12); // biPlanes
  header.writeUInt16LE(32, 14); // biBitCount
  header.writeUInt32LE(0, 16); // biCompression (BI_RGB)
  header.writeUInt32LE(bgra.length + mask.length, 20); // biSizeImage
  header.writeInt32LE(0, 24); // biXPelsPerMeter
  header.writeInt32LE(0, 28); // biYPelsPerMeter
  header.writeUInt32LE(0, 32); // biClrUsed
  header.writeUInt32LE(0, 36); // biClrImportant

  return Buffer.concat([header, bgra, mask]);
}

function imagesToIco(images, imageSizes) {
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(count, 4); // number of images

  const dir = Buffer.alloc(16 * count);
  let offset = 6 + dir.length;

  for (let i = 0; i < count; i++) {
    const img = images[i];
    const size = imageSizes[i];
    const entryOffset = i * 16;

    // width/height are 1 byte; 0 means 256.
    dir.writeUInt8(size === 256 ? 0 : size, entryOffset + 0);
    dir.writeUInt8(size === 256 ? 0 : size, entryOffset + 1);
    dir.writeUInt8(0, entryOffset + 2); // palette color count
    dir.writeUInt8(0, entryOffset + 3); // reserved
    dir.writeUInt16LE(1, entryOffset + 4); // planes
    dir.writeUInt16LE(32, entryOffset + 6); // bit count
    dir.writeUInt32LE(img.length, entryOffset + 8); // bytes in resource
    dir.writeUInt32LE(offset, entryOffset + 12); // image data offset

    offset += img.length;
  }

  return Buffer.concat([header, dir, ...images]);
}

async function main() {
  const dibBuffers = [];
  for (const size of sizes) {
    // Use "contain" to preserve transparency and avoid accidental cropping.
    const { data, info } = await sharp(sourcePng)
      .resize(size, size, { fit: 'contain' })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    if (info.width !== size || info.height !== size || info.channels !== 4) {
      throw new Error(`Unexpected raw image info for size ${size}: ${JSON.stringify(info)}`);
    }

    dibBuffers.push(dib32FromRgba(size, data));
  }

  const ico = imagesToIco(dibBuffers, sizes);
  await writeFile(outIco, ico);
  console.log(`Wrote ${path.relative(process.cwd(), outIco)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
