async function run() {
  const targetUrl = "https://jellyfin-jacklumber00.siren.mygiga.cloud/Users?api_key=a2aac09e434e4bcc897c1b181ca197eb";
  const res = await fetch(targetUrl);
  const data = await res.json();
  const userId = data[0].Id;

  const searchUrl = `https://jellyfin-jacklumber00.siren.mygiga.cloud/Users/${userId}/Items?searchTerm=obsession&IncludeItemTypes=Movie&Limit=1&api_key=a2aac09e434e4bcc897c1b181ca197eb`;
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();
  const movieId = searchData.Items[0]?.Id;
  console.log("movieId", movieId);

  if (movieId) {
      console.time("get-playback");
      const pbRes = await fetch(`http://localhost:3000/api/playback/${movieId}`);
      console.timeEnd("get-playback");
      const pbData = await pbRes.json();
      console.log("streamUrl", pbData.streamUrl);
      
      console.time("get-master");
      const mRes = await fetch(`http://localhost:3000${pbData.streamUrl}`);
      console.timeEnd("get-master");
      const mData = await mRes.text();
      console.log("master playlist:");
      console.log(mData.substring(0, 300));
      
      const lines = mData.split("\n");
      const mainLine = lines.find(l => l.includes(".m3u8"));
      if (mainLine) {
        // mainLine is a relative path or absolute path?
        console.log("mainLine", mainLine);
        // Let's assume it's relative
        const mUrl = `http://localhost:3000/api/jellyfin/proxy${mainLine}`;
        console.time("get-main");
        const mmRes = await fetch(mUrl);
        console.timeEnd("get-main");
        const mmData = await mmRes.text();
        console.log("main playlist:");
        console.log(mmData.substring(0, 300));
        
        const lines2 = mmData.split("\n");
        const tsLine = lines2.find(l => l.includes(".ts"));
        if (tsLine) {
          const tsUrl = `http://localhost:3000/api/jellyfin/proxy/Videos/${movieId}/hls/${tsLine.split("/").pop()}`;
          console.time("get-ts");
          const tsRes = await fetch(tsUrl);
          console.timeEnd("get-ts");
          console.log("ts status", tsRes.status);
        }
      }
  }
}
run();
