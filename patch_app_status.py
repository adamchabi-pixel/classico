import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_check = """          setIsJellyfinLoading(true);
          try {
            let libRes = await fetch("/api/jellyfin/movies");
            if (libRes.status === 401) {
              const restoreRes = await fetch("/api/jellyfin/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: targetUrl, apiKey: targetKey })
              });
              if (restoreRes.ok) {
                 const restoreData = await restoreRes.json();
                 if (restoreData.success) {
                    setJellyfinConfig({ configured: true, url: restoreData.url });
                    localStorage.setItem("classico_jellyfin_url", restoreData.url);
                    localStorage.setItem("classico_jellyfin_apikey", targetKey);
                    libRes = await fetch("/api/jellyfin/movies");
                 } else {
                    setJellyfinConfig({ configured: true, url: targetUrl });
                    setIsJellyfinError("Unable to connect to Jellyfin during auto-config.");
                 }
              }
            } else {
               setJellyfinConfig({ configured: true, url: targetUrl });
            }

            if (libRes && libRes.ok) {
              const libData = await libRes.json();
              if (libData.success) {
                setJellyfinMovies(libData.movies || []);
                try { set("classico_movies_cache", libData.movies || []); } catch(e) {}
              } else {
                setIsJellyfinError(libData.error || "Unable to read movies.");
              }
            }
          } catch (libErr) {"""

new_check = """          setIsJellyfinLoading(true);
          try {
            const statusRes = await fetch("/api/jellyfin/status");
            const statusData = await statusRes.json();
            
            if (!statusData.configured) {
              const restoreRes = await fetch("/api/jellyfin/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: targetUrl, apiKey: targetKey })
              });
              if (restoreRes.ok) {
                 const restoreData = await restoreRes.json();
                 if (restoreData.success) {
                    setJellyfinConfig({ configured: true, url: restoreData.url });
                    localStorage.setItem("classico_jellyfin_url", restoreData.url);
                    localStorage.setItem("classico_jellyfin_apikey", targetKey);
                 } else {
                    setJellyfinConfig({ configured: true, url: targetUrl });
                 }
              }
            } else {
               setJellyfinConfig({ configured: true, url: targetUrl });
            }

            let libRes = await fetch("/api/jellyfin/movies");
            if (libRes && libRes.ok) {
              const libData = await libRes.json();
              if (libData.success) {
                setJellyfinMovies(libData.movies || []);
                try { set("classico_movies_cache", libData.movies || []); } catch(e) {}
              } else {
                setIsJellyfinError(libData.error || "Unable to read movies.");
              }
            }
          } catch (libErr) {"""

content = content.replace(old_check, new_check)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
