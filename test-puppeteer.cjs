const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
      if (msg.text().includes('[PERF') || msg.text().includes('[SEEK') || msg.text().includes('[HLS') || msg.text().includes('[PLAYER STATE CHANGE]')) {
          console.log('BROWSER LOG:', msg.text());
      }
  });

  await page.goto('http://localhost:3000/cinema/db4c1708cbb5dd1676284a40f2950aba');
  
  console.log("Waiting for video to load...");
  await page.waitForSelector('video', { timeout: 15000 });
  await page.waitForFunction('document.querySelector("video").duration > 0', { timeout: 15000 });
  
  console.log("Playing...");
  await page.evaluate(() => {
     const v = document.querySelector('video');
     if (v.paused) v.play();
  });
  
  await new Promise(r => setTimeout(r, 5000));
  
  console.log("Seeking...");
  await page.evaluate(() => {
     const v = document.querySelector('video');
     v.currentTime = v.currentTime + 15;
  });
  
  await new Promise(r => setTimeout(r, 10000));
  
  await browser.close();
})();
