import sharp from 'sharp';
import { mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, 'public', 'icons');

// CropAid green color
const PRIMARY_COLOR = '#16a34a';
const WHITE = '#ffffff';

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create a simple icon SVG with the CropAid branding
function createIconSVG(size) {
  const padding = Math.floor(size * 0.1);
  const innerSize = size - (padding * 2);
  const centerX = size / 2;
  const centerY = size / 2;
  const leafSize = innerSize * 0.35;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <!-- Background with rounded corners -->
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="${PRIMARY_COLOR}"/>
  
  <!-- Leaf/Plant icon representing agriculture -->
  <g transform="translate(${centerX}, ${centerY})">
    <!-- Main leaf shape -->
    <path d="M0 ${-leafSize * 0.8} 
             C${leafSize * 0.6} ${-leafSize * 0.6} 
              ${leafSize * 0.8} ${-leafSize * 0.2} 
              ${leafSize * 0.6} ${leafSize * 0.3}
             C${leafSize * 0.4} ${leafSize * 0.5}
              ${leafSize * 0.1} ${leafSize * 0.6}
              0 ${leafSize * 0.5}
             C${-leafSize * 0.1} ${leafSize * 0.6}
              ${-leafSize * 0.4} ${leafSize * 0.5}
              ${-leafSize * 0.6} ${leafSize * 0.3}
             C${-leafSize * 0.8} ${-leafSize * 0.2}
              ${-leafSize * 0.6} ${-leafSize * 0.6}
              0 ${-leafSize * 0.8}" 
          fill="${WHITE}" />
    
    <!-- Stem -->
    <line x1="0" y1="${-leafSize * 0.3}" x2="0" y2="${leafSize * 0.8}" 
          stroke="${WHITE}" stroke-width="${size * 0.03}" stroke-linecap="round"/>
    
    <!-- Small circle (sun/target representing aid) -->
    <circle cx="0" cy="0" r="${leafSize * 0.15}" fill="${PRIMARY_COLOR}"/>
  </g>
</svg>`;
}

async function generateIcons() {
  console.log('Creating icons directory...');
  await mkdir(iconsDir, { recursive: true });

  console.log('Generating PWA icons...');
  
  for (const size of sizes) {
    const svgContent = createIconSVG(size);
    const pngPath = join(iconsDir, `icon-${size}x${size}.png`);
    
    try {
      await sharp(Buffer.from(svgContent))
        .resize(size, size)
        .png()
        .toFile(pngPath);
      
      console.log(`✓ Created icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`✗ Failed to create icon-${size}x${size}.png:`, error.message);
    }
  }

  console.log('\nDone! Icons generated in public/icons/');
}

generateIcons().catch(console.error);
