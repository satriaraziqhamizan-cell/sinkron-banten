import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SRC_LOGO = path.resolve(process.cwd(), 'public/brand/logo-original.png');
const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const BRAND_DIR = path.join(PUBLIC_DIR, 'brand');
const ICONS_DIR = path.join(PUBLIC_DIR, 'icons');

async function createTransparentEmblem(): Promise<Buffer> {
  // Crop the circular emblem above "SINKRON BANTEN"
  // Identified bounds: left: 316, top: 189, width: 654, height: 572
  const { data, info } = await sharp(SRC_LOGO)
    .extract({ left: 316, top: 189, width: 654, height: 572 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const minVal = Math.min(r, g, b);

    if (minVal >= 252) {
      // Pure or near pure white background -> transparent
      rgba[j] = 255;
      rgba[j + 1] = 255;
      rgba[j + 2] = 255;
      rgba[j + 3] = 0;
    } else if (minVal <= 235) {
      // Solid foreground colors
      rgba[j] = r;
      rgba[j + 1] = g;
      rgba[j + 2] = b;
      rgba[j + 3] = 255;
    } else {
      // Anti-aliased boundary interpolation
      const alphaFraction = (252 - minVal) / (252 - 235);
      const alphaByte = Math.max(0, Math.min(255, Math.round(alphaFraction * 255)));
      // Unmultiply color against white background to retain crisp edge color
      const unmult = (c: number) =>
        Math.max(0, Math.min(255, Math.round((c - 255 * (1 - alphaFraction)) / alphaFraction)));

      rgba[j] = unmult(r);
      rgba[j + 1] = unmult(g);
      rgba[j + 2] = unmult(b);
      rgba[j + 3] = alphaByte;
    }
  }

  // Composite trimmed transparent emblem onto a balanced square canvas with small margin (~4%)
  const emblemPng = await sharp(rgba, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();

  const squareSize = 706; // 654 + small margin
  const left = Math.round((squareSize - info.width) / 2);
  const top = Math.round((squareSize - info.height) / 2);

  return sharp({
    create: {
      width: squareSize,
      height: squareSize,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    },
  })
    .composite([{ input: emblemPng, left, top }])
    .png()
    .toBuffer();
}

async function generate() {
  console.log('Generating SINKRON Banten brand assets & icons...');

  if (!fs.existsSync(BRAND_DIR)) fs.mkdirSync(BRAND_DIR, { recursive: true });
  if (!fs.existsSync(ICONS_DIR)) fs.mkdirSync(ICONS_DIR, { recursive: true });

  const emblemSquare = await createTransparentEmblem();

  // 1. logo-mark variants (PNG & WebP, quality 85)
  console.log('Generating logo-mark variants in public/brand/...');
  await sharp(emblemSquare)
    .resize(256, 256)
    .png({ compressionLevel: 9 })
    .toFile(path.join(BRAND_DIR, 'logo-mark-256.png'));

  await sharp(emblemSquare)
    .resize(256, 256)
    .webp({ quality: 85 })
    .toFile(path.join(BRAND_DIR, 'logo-mark-256.webp'));

  await sharp(emblemSquare)
    .resize(128, 128)
    .png({ compressionLevel: 9 })
    .toFile(path.join(BRAND_DIR, 'logo-mark-128.png'));

  await sharp(emblemSquare)
    .resize(128, 128)
    .webp({ quality: 85 })
    .toFile(path.join(BRAND_DIR, 'logo-mark-128.webp'));
  console.log('✓ Generated logo-mark-128/256 (PNG & WebP)');

  // 2. logo-full variants (PNG & WebP, quality 85)
  console.log('Generating logo-full variants in public/brand/...');
  await sharp(SRC_LOGO)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(BRAND_DIR, 'logo-full-512.png'));

  await sharp(SRC_LOGO)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .webp({ quality: 85 })
    .toFile(path.join(BRAND_DIR, 'logo-full-512.webp'));

  await sharp(SRC_LOGO)
    .resize(256, 256, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(BRAND_DIR, 'logo-full-256.png'));

  await sharp(SRC_LOGO)
    .resize(256, 256, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .webp({ quality: 85 })
    .toFile(path.join(BRAND_DIR, 'logo-full-256.webp'));
  console.log('✓ Generated logo-full-256/512 (PNG & WebP)');

  // 3. Favicon & PWA "any" icons from emblem logo-mark
  console.log('Generating favicon & PWA any icons from emblem...');
  const faviconBuffer = await sharp(emblemSquare)
    .resize(48, 48)
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.ico'), faviconBuffer);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.png'), faviconBuffer);
  console.log('✓ Generated public/favicon.ico & public/favicon.png');

  await sharp(emblemSquare)
    .resize(192, 192)
    .png()
    .toFile(path.join(ICONS_DIR, 'icon-192.png'));

  await sharp(emblemSquare)
    .resize(512, 512)
    .png()
    .toFile(path.join(ICONS_DIR, 'icon-512.png'));
  console.log('✓ Generated public/icons/icon-192.png & icon-512.png (emblem only)');

  // 4. Apple Touch Icon (180x180) with clean background
  const appleEmblem = await sharp(emblemSquare)
    .resize(150, 150)
    .toBuffer();
  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: appleEmblem, left: 15, top: 15 }])
    .png()
    .toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'));
  console.log('✓ Generated public/apple-touch-icon.png');

  // 5. PWA Maskable Icon (512x512 with 20% safe margin) from full logo
  const innerLogo = await sharp(SRC_LOGO)
    .resize(320, 320, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: innerLogo, top: 96, left: 96 }])
    .png()
    .toFile(path.join(ICONS_DIR, 'icon-maskable-512.png'));
  console.log('✓ Generated public/icons/icon-maskable-512.png (20% safe margin)');

  // 6. OG Image (1200x630 on #133E6E brand blue)
  const ogCenterLogo = await sharp(SRC_LOGO)
    .resize(420, 420, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toBuffer();

  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 19, g: 62, b: 110, alpha: 1 },
    },
  })
    .composite([{ input: ogCenterLogo, top: 105, left: 390 }])
    .png()
    .toFile(path.join(PUBLIC_DIR, 'og-image.png'));
  console.log('✓ Generated public/og-image.png (1200x630 on #133E6E)');

  console.log('All brand assets successfully generated!');
}

generate().catch((err) => {
  console.error('Failed to generate brand assets:', err);
  process.exit(1);
});
