const sharp = require('sharp');
const fs = require('fs');

async function generateIcons() {
  const source = 'public/favicon.png';
  
  try {
    // Check if source exists
    if (!fs.existsSync(source)) {
      console.log('Source image not found');
      return;
    }

    console.log('Generating icons...');
    
    // Generate standard favicon
    await sharp(source)
      .resize(32, 32)
      .toFile('public/favicon-32x32.png');
      
    // Generate apple touch icon
    await sharp(source)
      .resize(180, 180)
      .toFile('public/apple-touch-icon-180.png');
      
    // Generate manifest icons
    await sharp(source)
      .resize(192, 192)
      .toFile('public/icon-192.png');
      
    await sharp(source)
      .resize(512, 512)
      .toFile('public/icon-512.png');

    console.log('Icons generated successfully.');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
