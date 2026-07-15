import re

with open("server.ts", "r", encoding="utf-8") as f:
    content = f.read()

status_api = """// Check config status
app.get("/api/jellyfin/status", (req, res) => {
  const config = getJellyfinConfig();
  res.json({ configured: !!config, url: config ? config.url : null });
});

// 4. List library movies from connected Jellyfin with 5-minute cache
"""
content = content.replace("// 4. List library movies from connected Jellyfin with 5-minute cache\n", status_api)

with open("server.ts", "w", encoding="utf-8") as f:
    f.write(content)
