import re

with open('src/components/CinemaPlayerView.tsx', 'r') as f:
    text = f.read()

# I need to clean up around line 1460 to 1480
# The bad part looks like:
'''
      } else {
        // Fallback Native HLS if Hls.js is not supported but native is
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            console.log("[STREAM LOAD] Lecture native HLS activée (Fallback)");
            video.src = playbackInfo.streamUrl;
        } else {
            console.log("[STREAM LOAD] Fallback HLS non supporté au niveau du navigateur");
            video.src = playbackInfo.streamUrl;
        }
        logChrono("Attribution du src vidéo");
        video.load();
      }
        // Fallback
        console.log("[STREAM LOAD] Fallback HLS non supporté au niveau du navigateur");
        logChrono("Attribution du src vidéo");
        video.src = playbackInfo.streamUrl;
        video.load();
      }
    }
'''

to_find = '''      } else {
        // Fallback Native HLS if Hls.js is not supported but native is
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            console.log("[STREAM LOAD] Lecture native HLS activée (Fallback)");
            video.src = playbackInfo.streamUrl;
        } else {
            console.log("[STREAM LOAD] Fallback HLS non supporté au niveau du navigateur");
            video.src = playbackInfo.streamUrl;
        }
        logChrono("Attribution du src vidéo");
        video.load();
      }
        // Fallback
        console.log("[STREAM LOAD] Fallback HLS non supporté au niveau du navigateur");
        logChrono("Attribution du src vidéo");
        video.src = playbackInfo.streamUrl;
        video.load();
      }
    }'''

replacement = '''      } else {
        // Fallback Native HLS if Hls.js is not supported but native is
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            console.log("[STREAM LOAD] Lecture native HLS activée (Fallback)");
            video.src = playbackInfo.streamUrl;
        } else {
            console.log("[STREAM LOAD] Fallback HLS non supporté au niveau du navigateur");
            video.src = playbackInfo.streamUrl;
        }
        logChrono("Attribution du src vidéo");
        video.load();
      }
    }'''

text = text.replace(to_find, replacement)

with open('src/components/CinemaPlayerView.tsx', 'w') as f:
    f.write(text)
