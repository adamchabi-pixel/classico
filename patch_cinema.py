import sys

with open("src/components/CinemaPlayerView.tsx", "r") as f:
    content = f.read()

# Replace the fetching logic in fetchPlaybackData
target_fetch = r'const prefetches = \(window as any\)\.playbackPrefetches \|\| \{\};.*?if \(active\) \{'
replacement_fetch = """
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

        if (active) {"""

import re
content = re.sub(target_fetch, replacement_fetch, content, flags=re.DOTALL)

with open("src/components/CinemaPlayerView.tsx", "w") as f:
    f.write(content)
print("Patched CinemaPlayerView")
