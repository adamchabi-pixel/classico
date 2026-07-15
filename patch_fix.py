import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

pattern = re.compile(r'const tryFetch = async \(\) => \{[\s\S]*?checkJellyfinSetup\(\);', re.MULTILINE)

new_tryFetch = """const tryFetch = async () => {
        try {
          const isNetlify = typeof window !== "undefined" && window.location && window.location.hostname && (!window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1") && !window.location.hostname.includes("run.app"));
          const defaultUrl = "https://jellyfin-jacklumber00.siren.mygiga.cloud";
          const defaultApiKey = "a2aac09e434e4bcc897c1b181ca197eb";
          const localUrl = localStorage.getItem("classico_jellyfin_url");
          const localKey = localStorage.getItem("classico_jellyfin_apikey");

          if (isNetlify || !localUrl || !localKey) {
            localStorage.setItem("classico_jellyfin_url", defaultUrl);
            localStorage.setItem("classico_jellyfin_apikey", defaultApiKey);
          }
          
          const targetUrl = localStorage.getItem("classico_jellyfin_url") || defaultUrl;
          const targetKey = localStorage.getItem("classico_jellyfin_apikey") || defaultApiKey;

          setIsJellyfinLoading(true);
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
              } else {
                setIsJellyfinError(libData.error || "Unable to read movies.");
              }
            }
          } catch (libErr) {
            console.warn("Failed to load library movies on check:", libErr);
            setIsJellyfinError("Unable to connect to Jellyfin.");
          } finally {
            setIsJellyfinLoading(false);
          }
        } catch (err) {
          console.warn(`Jellyfin connection check attempt ${attempts + 1} failed:`, err);
          if (attempts < maxAttempts - 1) {
            attempts++;
            setTimeout(tryFetch, 1500 * attempts);
          } else {
            console.warn("Jellyfin connection check error:", err);
            const defaultUrl = "https://jellyfin-jacklumber00.siren.mygiga.cloud";
            setJellyfinConfig({ configured: true, url: defaultUrl });
            setIsJellyfinLoading(false);
            setIsJellyfinHeroLoading(false);
          }
        }
      };
      
      tryFetch();
    };

    checkJellyfinSetup();"""

content = re.sub(pattern, new_tryFetch, content)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
