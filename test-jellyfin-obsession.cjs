async function run() {
  const targetUrl = "https://jellyfin-jacklumber00.siren.mygiga.cloud/Users?api_key=a2aac09e434e4bcc897c1b181ca197eb";
  const res = await fetch(targetUrl);
  const data = await res.json();
  const userId = data[0].Id;

  const searchUrl = `https://jellyfin-jacklumber00.siren.mygiga.cloud/Users/${userId}/Items?searchTerm=obsession&IncludeItemTypes=Movie&Limit=1&api_key=a2aac09e434e4bcc897c1b181ca197eb`;
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();
  const movieId = searchData.Items[0]?.Id;
  console.log("movieId obsession", movieId);

  if (movieId) {
      const pbUrl = `https://jellyfin-jacklumber00.siren.mygiga.cloud/Items/${movieId}/PlaybackInfo?api_key=a2aac09e434e4bcc897c1b181ca197eb&userId=${userId}`;
      console.time("pbInfo");
      const pbRes = await fetch(pbUrl, { method: 'POST', body: JSON.stringify({ DeviceProfile: { Name: "Modern Browser" } }), headers: { 'Content-Type': 'application/json' } });
      console.timeEnd("pbInfo");
      const pbData = await pbRes.json();
      const source = pbData.MediaSources[0];
      const transUrl = source.TranscodingUrl;
      console.log("TranscodingUrl", transUrl);
      
      if (transUrl) {
          const tUrl = `https://jellyfin-jacklumber00.siren.mygiga.cloud${transUrl}`;
          console.log("tUrl", tUrl);
          console.time("trans-manifest");
          const mRes = await fetch(tUrl);
          console.timeEnd("trans-manifest");
          console.log("manifest status", mRes.status);
      }
  }
}
run();
