const http = require('http');

(async () => {
  try {
    const tsUrl = `http://localhost:3000/api/jellyfin/proxy/videos/1d283f98-f405-8e03-40c3-daed4afe08ea/hls1/main/0.ts?DeviceId=CinemaAppClient&MediaSourceId=1d283f98f4058e0340c3daed4afe08ea&VideoCodec=h264&AudioCodec=aac%2Cmp3&AudioStreamIndex=1&VideoBitrate=140000000&AudioBitrate=1024000&MaxFramerate=23.976025&SegmentContainer=ts&BreakOnNonKeyFrames=False&PlaySessionId=a995277e9b7e4d1589d571dee7f40f43&RequireAvc=false&EnableAudioVbrEncoding=true&Tag=9e51b010cf4719cabe819fe5d6b640c1&hevc-level=150&hevc-videobitdepth=10&hevc-profile=main10&TranscodeReasons=DirectPlayError&allowVideoStreamCopy=false&allowAudioStreamCopy=false&Static=false&MaxVideoBitrate=140000000&api_key=a2aac09e434e4bcc897c1b181ca197eb&runtimeTicks=0&actualSegmentLengthTicks=30030000`;
    
    console.log("Fetching proxy TS:", tsUrl);
    
    const tsRes = await fetch(tsUrl, { redirect: "manual" });
    console.log("Proxy Status:", tsRes.status);
    console.log("Proxy Headers:", tsRes.headers);
    if (tsRes.status >= 400) {
       console.log("Error Body:", await tsRes.text());
    }
  } catch(e) {
    console.error(e);
  }
})();
