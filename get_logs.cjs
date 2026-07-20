const http = require('http');

(async () => {
  const apiKey = "a2aac09e434e4bcc897c1b181ca197eb";
  const url = `https://jellyfin-jacklumber00.siren.mygiga.cloud/System/Logs?api_key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data || data.length === 0) {
    console.log("No logs available");
    return;
  }
  const latestLog = data[0].Name;
  
  const logUrl = `https://jellyfin-jacklumber00.siren.mygiga.cloud/System/Logs/Log?name=${latestLog}&api_key=${apiKey}`;
  const logRes = await fetch(logUrl);
  const logText = await logRes.text();
  
  const lines = logText.split('\n');
  const recent = lines.slice(-50);
  console.log(recent.join('\n'));
})();
