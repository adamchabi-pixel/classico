import sys

with open("src/components/CinemaPlayerView.tsx", "r") as f:
    content = f.read()

start_str = "const prefetches = (window as any).playbackPrefetches || {};"
end_str = "if (active) {"

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    new_fetch = """
        const isNumeric = /^\d+$/.test(movieId);
        if (movieId.startsWith("tt") || isNumeric) {
          const iframeResult = {
            id: movieId,
            streamUrl: `https://player.videasy.net/movie/${movieId}?color=FFD700&overlay=true`,
            duration: 0,
            container: "iframe",
            title: movieTitle || "Film (Embed)",
            isDirect: true,
            isIframeEmbed: true,
            iframeSrc: `https://player.videasy.net/movie/${movieId}?color=FFD700&overlay=true`,
            subtitles: [],
            audios: []
          };
          setPlaybackInfo(iframeResult);
          setIsLoading(false);
          return;
        }

        const res = await fetch(`/api/playback/${encodeURIComponent(movieId)}`);
        if (!res.ok) throw new Error("Film introuvable");
        const data = await res.json();
        
        if (data.isIframeEmbed) {
           setPlaybackInfo({
             id: movieId,
             streamUrl: data.iframeSrc,
             duration: 0,
             container: "iframe",
             title: movieTitle || "Film (Embed)",
             isDirect: true,
             isIframeEmbed: true,
             iframeSrc: data.iframeSrc,
             subtitles: [],
             audios: []
           });
           setIsLoading(false);
           return;
        }
        
        """
    content = content[:start_idx] + new_fetch + content[end_idx:]

    with open("src/components/CinemaPlayerView.tsx", "w") as f:
        f.write(content)
    print("Patched successfully")
else:
    print("Not found")
