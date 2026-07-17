const http = require("http");
const https = require("https");
const { URL } = require("url");

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
      const pbUrl = `https://jellyfin-jacklumber00.siren.mygiga.cloud/Items/${movieId}/PlaybackInfo?api_key=a2aac09e434e4bcc897c1b181ca197eb&userId=${userId}`;
      const deviceProfile = {
        DeviceProfile: {
          Name: "Modern Browser",
          MaxStreamingBitrate: 140000000,
          TranscodingProfiles: [
            {
              Container: "ts",
              Type: "Video",
              AudioCodec: "aac",
              VideoCodec: "h264",
              Context: "Streaming",
              Protocol: "hls"
            }
          ]
        }
      };
      
      const pbRes = await fetch(pbUrl, { 
        method: 'POST', 
        body: JSON.stringify(deviceProfile), 
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `MediaBrowser Client="ClassicoClient", Device="ModernBrowser", DeviceId="ModernBrowser", Version="1.0.0", Token="a2aac09e434e4bcc897c1b181ca197eb"`
        } 
      });
      console.log(pbRes.status);
      const pbData = await pbRes.json();
      console.log("TranscodingUrl:", pbData.MediaSources[0].TranscodingUrl);
  }
}
run();
