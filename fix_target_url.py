import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_else = """            } else {
               setJellyfinConfig({ configured: true, url: targetUrl });
            }"""

new_else = """            } else {
               setJellyfinConfig({ configured: true, url: statusData.url || targetUrl });
               if (statusData.url && statusData.url !== targetUrl) {
                 localStorage.setItem("classico_jellyfin_url", statusData.url);
               }
            }"""
content = content.replace(old_else, new_else)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
