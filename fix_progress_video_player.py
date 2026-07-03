import re

with open("src/components/VideoPlayer.tsx", "r") as f:
    content = f.read()

# Fix interval progress
target1 = """              const savedStr = localStorage.getItem("classico_progress") || "{}";
              const progressObj = JSON.parse(savedStr);
              progressObj[movieId] = newProgress / prev.duration;
              localStorage.setItem("classico_progress", JSON.stringify(progressObj));"""
replacement1 = """              const savedStr = localStorage.getItem("classico_progress") || "{}";
              const progressObj = JSON.parse(savedStr);
              progressObj[movieId] = {
                id: movieId,
                title: movieTitle,
                poster: moviePoster || "",
                currentTime: newProgress,
                duration: prev.duration,
                updatedAt: Date.now()
              };
              localStorage.setItem("classico_progress", JSON.stringify(progressObj));"""
if target1 in content:
    content = content.replace(target1, replacement1)

# Fix onTimeUpdate progress
target2 = """                  const savedStr = localStorage.getItem("classico_progress") || "{}";
                  const progressObj = JSON.parse(savedStr);
                  progressObj[movieId] = curTime / dur;
                  localStorage.setItem("classico_progress", JSON.stringify(progressObj));"""
replacement2 = """                  const savedStr = localStorage.getItem("classico_progress") || "{}";
                  const progressObj = JSON.parse(savedStr);
                  progressObj[movieId] = {
                    id: movieId,
                    title: movieTitle,
                    poster: moviePoster || "",
                    currentTime: curTime,
                    duration: dur,
                    updatedAt: Date.now()
                  };
                  localStorage.setItem("classico_progress", JSON.stringify(progressObj));"""
if target2 in content:
    content = content.replace(target2, replacement2)

with open("src/components/VideoPlayer.tsx", "w") as f:
    f.write(content)
