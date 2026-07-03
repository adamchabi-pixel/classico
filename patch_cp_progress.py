import re

with open("src/components/CinemaPlayerView.tsx", "r") as f:
    content = f.read()

# Make sure moviePoster is in Props
if "moviePoster?: string;" not in content:
    content = content.replace("  movieDuration?: string;\n  onClose:", "  movieDuration?: string;\n  moviePoster?: string;\n  onClose:")
    content = content.replace("  movieDuration,\n  onClose\n}:", "  movieDuration,\n  moviePoster,\n  onClose\n}:")

# Let's find onTimeUpdate for CinemaPlayerView
save_target_regex = re.compile(r'(onTimeUpdate=\{\(e\) => \{.*?const el = e\.currentTarget;.*?const curTime = el\.currentTime;.*?const dur = el\.duration;.*?)(\s*\/\/\s*Save progress percentage.*?\}\s*\})', re.DOTALL)

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

if save_target_regex.search(content):
    content = save_target_regex.sub(r'\1' + '\n' + save_replacement, content)
    print("Patched CinemaPlayerView progress")
else:
    # Maybe the saving code is slightly different or doesn't exist yet
    # Let's find onTimeUpdate and insert it
    timeupdate_target = "            onTimeUpdate={(e) => {"
    timeupdate_inject = """            onTimeUpdate={(e) => {
              const curTime = e.currentTarget.currentTime;
              const dur = e.currentTarget.duration;
              
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
                } catch (err) {}
              }
"""
    if "classico_progress" not in content and timeupdate_target in content:
        content = content.replace(timeupdate_target, timeupdate_inject)
        print("Injected progress saving in CinemaPlayerView")

with open("src/components/CinemaPlayerView.tsx", "w") as f:
    f.write(content)
