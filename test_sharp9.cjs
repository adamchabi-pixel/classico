const sharp = require('sharp');
sharp('public/app-ico-orig.png')
  .extract({ left: 447, top: 183, width: 640, height: 640 })
  .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
  .toFile('public/app-ico.png')
  .then(info => console.log('Perfect zoom:', info))
  .catch(console.error);
