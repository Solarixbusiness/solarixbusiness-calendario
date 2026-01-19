const sharp = require('sharp');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'elaborati', 'rifammi il logo piu figo.png');
const outputDir = path.join(__dirname, '..', 'public', 'icons');

async function generateIcons() {
  try {
    // Generate 192x192
    await sharp(inputPath)
      .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(path.join(outputDir, 'icon-192x192.png'));
    console.log('Created icon-192x192.png');

    // Generate 512x512
    await sharp(inputPath)
      .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(path.join(outputDir, 'icon-512x512.png'));
    console.log('Created icon-512x512.png');

    // Generate favicon
    await sharp(inputPath)
      .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(path.join(outputDir, '..', 'favicon.ico'));
    console.log('Created favicon.ico');

    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
