const http = require("http");

async function run() {
  const targetUrl = "https://jellyfin-jacklumber00.siren.mygiga.cloud/Users?api_key=a2aac09e434e4bcc897c1b181ca197eb";
  const res = await fetch(targetUrl);
  const data = await res.json();
  const userId = data[0].Id;

  const searchUrl = `https://jellyfin-jacklumber00.siren.mygiga.cloud/Users/${userId}/Items?searchTerm=obsession&IncludeItemTypes=Movie&Limit=1&api_key=a2aac09e434e4bcc897c1b181ca197eb`;
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();
  const movieId = searchData.Items[0]?.Id;

  if (movieId) {
      console.time("getPlaybackData");
      const pbRes = await fetch(`http://localhost:3000/api/playback/${movieId}`);
      console.timeEnd("getPlaybackData");
      const pbData = await pbRes.json();
      console.log("streamUrl:", pbData.streamUrl);
      
      console.time("master.m3u8");
      const mRes = await fetch(`http://localhost:3000${pbData.streamUrl}`);
      console.timeEnd("master.m3u8");
      const mData = await mRes.text();
      
      const lines = mData.split("\n");
      const mainLine = lines.find(l => l.includes(".m3u8"));
      if (mainLine) {
        const mUrl = `http://localhost:3000/api/jellyfin/proxy${mainLine}`;
        console.time("main.m3u8");
        const mmRes = await fetch(mUrl);
        console.timeEnd("main.m3u8");
        const mmData = await mmRes.text();
        
        const lines2 = mmData.split("\n");
        const tsLines = lines2.filter(l => l.includes(".ts"));
        if (tsLines.length > 0) {
          // fetch first segment
          const tsUrl0 = `http://localhost:3000/api/jellyfin/proxy/Videos/${movieId}/hls/${tsLines[0].split("/").pop()}`;
          console.time("fetch 0.ts");
          const tsRes0 = await fetch(tsUrl0);
          console.timeEnd("fetch 0.ts");
          
          // now simulate seek by fetching a segment much later (e.g. 5th segment, which is 10s in)
          if (tsLines.length > 5) {
              const tsUrl5 = `http://localhost:3000/api/jellyfin/proxy/Videos/${movieId}/hls/${tsLines[5].split("/").pop()}`;
              console.time("fetch 5.ts (seek 10s)");
              const tsRes5 = await fetch(tsUrl5);
              console.timeEnd("fetch 5.ts (seek 10s)");
          }
        }
      }
  }
}
run();
