const fs = require("fs");

async function run() {
    const url = "https://jellyfin-jacklumber00.siren.mygiga.cloud";
    const apiKey = "a2aac09e434e4bcc897c1b181ca197eb";
    const movieId = "b1023982e27edf175c408667d6335c10"; // The Matrix
    
    const res = await fetch(`${url}/Users?api_key=${apiKey}`);
    const users = await res.json();
    const userId = users[0].Id;
    
    const pbRes = await fetch(`${url}/Items/${movieId}/PlaybackInfo?api_key=${apiKey}&userId=${userId}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            DeviceProfile: {
                Name: "Modern Browser",
                MaxStreamingBitrate: 4000000,
                MaxStaticBitrate: 4000000,
                MusicStreamingBitrate: 320000,
                DirectPlayProfiles: [
                    {
                        Container: "mp4,m4v,webm",
                        Type: "Video",
                        VideoCodec: "h264,vp8,vp9",
                        AudioCodec: "aac,mp3,opus"
                    }
                ],
                TranscodingProfiles: [
                    {
                        Container: "ts",
                        Type: "Video",
                        AudioCodec: "aac,mp3",
                        VideoCodec: "h264",
                        Context: "Streaming",
                        Protocol: "hls"
                    }
                ],
                SubtitleProfiles: [
                    { Format: "vtt", Method: "External" },
                    { Format: "srt", Method: "External" }
                ]
            }
        })
    });
    const pb = await pbRes.json();
    if (!pb.MediaSources || pb.MediaSources.length === 0) {
        console.log("No MediaSources found for Matrix!");
        return;
    }
    const source = pb.MediaSources[0];
    console.log("--- SOURCE DETAILS ---");
    console.log("Name:", source.Name);
    console.log("Container:", source.Container);
    console.log("SupportsDirectPlay:", source.SupportsDirectPlay);
    console.log("SupportsTranscoding:", source.SupportsTranscoding);
    console.log("Path:", source.Path);
    console.log("VideoStreams:");
    const videos = source.MediaStreams.filter(s => s.Type === 'Video');
    videos.forEach(v => {
        console.log(` - Index: ${v.Index}, Codec: ${v.Codec}, Width: ${v.Width}, VideoRange: ${v.VideoRange}, Title: ${v.Title}`);
    });
    console.log("AudioStreams:");
    const audios = source.MediaStreams.filter(s => s.Type === 'Audio');
    audios.forEach(a => {
        console.log(` - Index: ${a.Index}, Codec: ${a.Codec}, Language: ${a.Language}, Title: ${a.Title}, Channels: ${a.Channels}`);
    });
    console.log("SubtitleStreams:");
    const subs = source.MediaStreams.filter(s => s.Type === 'Subtitle');
    subs.forEach(s => {
        console.log(` - Index: ${s.Index}, Codec: ${s.Codec}, Language: ${s.Language}, Title: ${s.Title}, DeliveryMethod: ${s.DeliveryMethod}`);
    });
}
run();
