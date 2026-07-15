import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_logic = """          const isNetlify = typeof window !== "undefined" && window.location && window.location.hostname && (!window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1") && !window.location.hostname.includes("run.app"));
          const defaultUrl = "https://jellyfin-jacklumber00.siren.mygiga.cloud";
          const defaultApiKey = "a2aac09e434e4bcc897c1b181ca197eb";
          const localUrl = localStorage.getItem("classico_jellyfin_url");
          const localKey = localStorage.getItem("classico_jellyfin_apikey");

          if (isNetlify || !localUrl || !localKey) {"""

new_logic = """          const defaultUrl = "https://jellyfin-jacklumber00.siren.mygiga.cloud";
          const defaultApiKey = "a2aac09e434e4bcc897c1b181ca197eb";
          const localUrl = localStorage.getItem("classico_jellyfin_url");
          const localKey = localStorage.getItem("classico_jellyfin_apikey");

          if (!localUrl || !localKey) {"""

content = content.replace(old_logic, new_logic)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
