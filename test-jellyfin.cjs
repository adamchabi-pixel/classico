async function run() {
  const targetUrl = "https://jellyfin-jacklumber00.siren.mygiga.cloud/Users?api_key=a2aac09e434e4bcc897c1b181ca197eb";
  const res = await fetch(targetUrl);
  const data = await res.json();
  const userId = data[0].Id;

  const searchUrl = `https://jellyfin-jacklumber00.siren.mygiga.cloud/Users/${userId}/Items?IncludeItemTypes=Movie&Limit=1&api_key=a2aac09e434e4bcc897c1b181ca197eb`;
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();
  const movieId = searchData.Items[0].Id;

  const fallbackPath = `/Videos/${movieId}/master.m3u8?Static=false&VideoCodec=h264&AudioCodec=aac&TranscodingMaxAudioChannels=2&SubtitleStreamIndex=-1&Preset=ultrafast&SegmentContainer=ts&BreakOnNonKeyFrames=true&SegmentLength=2&MinSegments=1&VideoBitrate=1500000&MaxVideoBitrate=1500000&MaxWidth=1280&MaxHeight=720&DeviceId=CinemaAppClient&MediaSourceId=${movieId}&api_key=a2aac09e434e4bcc897c1b181ca197eb`;
  const playlistUrl = `https://jellyfin-jacklumber00.siren.mygiga.cloud${fallbackPath}`;
  console.log("playlistUrl", playlistUrl);
  
  console.time("fetch-playlist");
  const plRes = await fetch(playlistUrl);
  console.timeEnd("fetch-playlist");
  console.log(plRes.status);
  const plData = await plRes.text();
  console.log(plData);
}
run();
