const sharp = require('sharp');
sharp({
  create: {
    width: 256,
    height: 256,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 }
  }
})
.composite([{
  input: Buffer.from(`<svg width="256" height="256">
    <rect x="10" y="10" width="236" height="236" rx="20" ry="20" fill="none" stroke="#FFD700" stroke-width="10"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="120" font-family="serif" fill="#FFD700">C</text>
    <text x="50%" y="75%" dominant-baseline="middle" text-anchor="middle" font-size="40" font-family="serif" font-style="italic" fill="#FFD700">The Best</text>
  </svg>`),
  blend: 'over'
}])
.png()
.toFile('public/app-ico.png')
.then(() => console.log('done'))
.catch(console.error);
