import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_block = """            let libRes = await fetch("/api/jellyfin/movies");
            if (libRes && libRes.ok) {
              const libData = await libRes.json();
              if (libData.success) {
                setJellyfinMovies(libData.movies || []);
                try { set("classico_movies_cache", libData.movies || []); } catch(e) {}
              } else {
                setIsJellyfinError(libData.error || "Unable to read movies.");
              }
            }"""

new_block = """            let libRes = await fetch("/api/jellyfin/movies");
            if (libRes && libRes.ok) {
              const libData = await libRes.json();
              if (libData.success) {
                setJellyfinMovies(libData.movies || []);
                try { set("classico_movies_cache", libData.movies || []); } catch(e) {}
              } else {
                setIsJellyfinError(libData.error || "Unable to read movies.");
              }
            } else {
              setIsJellyfinError("Failed to communicate with media server.");
            }"""

content = content.replace(old_block, new_block)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
