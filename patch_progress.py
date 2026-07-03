import re

with open("src/components/VideoPlayer.tsx", "r") as f:
    content = f.read()

target = """interface VideoPlayerProps {
  streamUrl: string | null;
  movieTitle: string;
  movieSymbol: string;
  movieGradient: string;
  movieDuration: string;
  onCloseView: () => void;
  movieId?: string;
  isJellyfinMovie?: boolean;
  moviePoster?: string;
}"""
# In case it has or doesn't have moviePoster already
if "moviePoster?: string;" not in content:
    content = content.replace("  isJellyfinMovie?: boolean;\n}", "  isJellyfinMovie?: boolean;\n  moviePoster?: string;\n}")

# Fix the component signature
content = content.replace("isJellyfinMovie\n}: VideoPlayerProps) => {", "isJellyfinMovie,\n  moviePoster\n}: VideoPlayerProps) => {")
content = content.replace("isJellyfinMovie = false\n}: VideoPlayerProps", "isJellyfinMovie = false,\n  moviePoster\n}: VideoPlayerProps")

# Now replace the local storage saving block
save_target = """              // Save progress percentage to local storage for "Continue Watching" functionality
              if (curTime > 0 && dur > 0 && movieId) {
                try {
                  const savedStr = localStorage.getItem("classico_progress") || "{}";
                  const progressObj = JSON.parse(savedStr);
                  progressObj[movieId] = curTime / dur;
                  localStorage.setItem("classico_progress", JSON.stringify(progressObj));
                } catch (e) {
                  // ignore
                }
              }"""

save_replacement = """              // Save detailed progress object for Recently Viewed functionality
              if (curTime > 0 && dur > 0 && movieId) {
                try {
                  const savedStr = localStorage.getItem("classico_progress") || "{}";
                  const progressObj = JSON.parse(savedStr);
                  progressObj[movieId] = {
                    id: movieId,
                    title: movieTitle,
                    poster: moviePoster,
                    currentTime: curTime,
                    duration: dur,
                    updatedAt: Date.now()
                  };
                  localStorage.setItem("classico_progress", JSON.stringify(progressObj));
                } catch (e) {
                  // ignore
                }
              }"""
content = content.replace(save_target, save_replacement)

# Also check for seek on mount!
# The user wants "reprendre exactement là où il s'était arrêté"
# Let's see if there's any `video.currentTime = ` on mount.
# I will just insert an onLoadedMetadata handler or a useEffect.
with open("src/components/VideoPlayer.tsx", "w") as f:
    f.write(content)

print("Patched VideoPlayer progress")
