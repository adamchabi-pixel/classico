const http = require('http');
(async () => {
  const pbRes = await fetch("http://localhost:3000/api/playback/17e92bd7b53247247c6010f6631fe806");
  const pbData = await pbRes.json();
  const hlsUrl = "http://localhost:3000" + pbData.streamUrl;
  console.log("Master:", hlsUrl);
  
  const m3u8Res = await fetch(hlsUrl);
  const m3u8Text = await m3u8Res.text();
  console.log("Master M3U8:", m3u8Text);
  const mainLine = m3u8Text.split("\n").find(l => l.startsWith("main.m3u8"));
  if (!mainLine) return;
  const mainUrl = hlsUrl.split("master.m3u8")[0] + mainLine;
  console.log("Main:", mainUrl);
  
  const mainRes = await fetch(mainUrl);
  const mainText = await mainRes.text();
  console.log("Main M3U8:", mainText.substring(0, 500));
  const tsLine = mainText.split("\n").find(l => l.includes(".ts"));
  if (!tsLine) return;
  const tsUrl = hlsUrl.split("master.m3u8")[0] + tsLine;
  console.log("Segment:", tsUrl);
  
  const tsRes = await fetch(tsUrl);
  console.log("Segment Status:", tsRes.status);
})();
