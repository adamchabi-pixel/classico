async function run() {
  const targetUrl = "https://jellyfin-jacklumber00.siren.mygiga.cloud/Users?api_key=a2aac09e434e4bcc897c1b181ca197eb";
  const res = await fetch(targetUrl);
  const data = await res.json();
  const userId = data[0].Id;

  const searchUrl = `https://jellyfin-jacklumber00.siren.mygiga.cloud/Users/${userId}/Items?searchTerm=obsession&IncludeItemTypes=Movie&Limit=1&api_key=a2aac09e434e4bcc897c1b181ca197eb`;
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();
  const movieId = searchData.Items[0]?.Id;

  const itemUrl = `https://jellyfin-jacklumber00.siren.mygiga.cloud/Users/${userId}/Items/${movieId}?api_key=a2aac09e434e4bcc897c1b181ca197eb`;
  const itemRes = await fetch(itemUrl, {
      headers: {
        "Accept": "application/json",
        "X-Emby-Token": "a2aac09e434e4bcc897c1b181ca197eb",
        "Authorization": `MediaBrowser Client="ClassicoClient", Device="ModernBrowser", DeviceId="ModernBrowser", Version="1.0.0", Token="a2aac09e434e4bcc897c1b181ca197eb"`
      }
    });
  const itemData = await itemRes.json();
  console.log("MediaSources present:", !!itemData.MediaSources);
  if (itemData.MediaSources) {
      console.log(itemData.MediaSources.length);
  }
}
run();
