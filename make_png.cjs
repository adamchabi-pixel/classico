const Jimp = require('jimp');

new Jimp(256, 256, 0xFFFFFFFF, (err, image) => {
  if (err) throw err;
  
  // draw a gold border
  const gold = 0xFFD700FF;
  for (let x = 10; x < 246; x++) {
    for (let y = 10; y < 246; y++) {
      if (x < 20 || x > 236 || y < 20 || y > 236) {
        image.setPixelColor(gold, x, y);
      }
    }
  }

  Jimp.loadFont(Jimp.FONT_SANS_128_BLACK).then(font => {
    image.print(font, 75, 40, "C");
    image.write('public/app-ico.png', () => {
      console.log('done');
    });
  });
});
