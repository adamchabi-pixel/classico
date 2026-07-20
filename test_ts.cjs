const http = require('http');

(async () => {
  const apiKey = "a2aac09e434e4bcc897c1b181ca197eb";
  const mainUrl = `https://jellyfin-jacklumber00.siren.mygiga.cloud/videos/1d283f98-f405-8e03-40c3-daed4afe08ea/main.m3u8?DeviceId=ModernBrowser&MediaSourceId=1d283f98f4058e0340c3daed4afe08ea&VideoCodec=h264&AudioCodec=aac&AudioStreamIndex=1&VideoBitrate=140000000&AudioBitrate=1024000&MaxFramerate=23.976025&SegmentContainer=ts&BreakOnNonKeyFrames=False&PlaySessionId=77db832380a54116adb8fae43cd83898&RequireAvc=false&EnableAudioVbrEncoding=true&Tag=9e51b010cf4719cabe819fe5d6b640c1&hevc-level=150&hevc-videobitdepth=10&hevc-profile=main10&TranscodeReasons=DirectPlayError&allowVideoStreamCopy=false&allowAudioStreamCopy=false&Static=false&MaxVideoBitrate=140000000&api_key=${apiKey}`;
  
  const mainRes = await fetch(mainUrl);
  const mainText = await mainRes.text();
  const tsLine = mainText.split('\n').find(l => l.includes('.ts'));
  if (!tsLine) {
    console.log("No ts line found in main.m3u8");
    return;
  }
  
  console.log("TS Line:", tsLine);
  const tsUrl = `https://jellyfin-jacklumber00.siren.mygiga.cloud/videos/1d283f98-f405-8e03-40c3-daed4afe08ea/${tsLine}`;
  console.log("Fetching:", tsUrl);
  
  const tsRes = await fetch(tsUrl);
  console.log("Status:", tsRes.status);
  if (tsRes.status >= 400) {
     console.log("Error Body:", await tsRes.text());
  }
})();
