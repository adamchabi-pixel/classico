import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_restore = """              if (restoreRes.ok) {
                 const restoreData = await restoreRes.json();
                 if (restoreData.success) {
                    setJellyfinConfig({ configured: true, url: restoreData.url });
                    localStorage.setItem("classico_jellyfin_url", restoreData.url);
                    localStorage.setItem("classico_jellyfin_apikey", targetKey);
                 } else {
                    setJellyfinConfig({ configured: true, url: targetUrl });
                 }
              }"""

new_restore = """              if (restoreRes.ok) {
                 const restoreData = await restoreRes.json();
                 if (restoreData.success) {
                    setJellyfinConfig({ configured: true, url: restoreData.url });
                    localStorage.setItem("classico_jellyfin_url", restoreData.url);
                    localStorage.setItem("classico_jellyfin_apikey", targetKey);
                 } else {
                    setJellyfinConfig({ configured: true, url: targetUrl });
                 }
              } else {
                 setJellyfinConfig({ configured: true, url: targetUrl });
              }"""

content = content.replace(old_restore, new_restore)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
