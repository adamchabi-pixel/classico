const fs = require('fs');
const https = require('https');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 303) {
        download(res.headers.location, dest).then(resolve).catch(reject);
      } else {
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function run() {
  const url = 'https://drive.google.com/uc?export=download&id=1Te3RGKhkKS66KsWMM9stTSfajZFdHi_6';
  await download(url, 'public/favicon.png');
  fs.copyFileSync('public/favicon.png', 'public/apple-touch-icon.png');
  console.log('Downloaded and copied to apple-touch-icon.png');
}

run();
