import re

with open("server.ts", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("const CONFIG_PATH = path.join(process.cwd(), \"jellyfin-config.json\");", "const CONFIG_PATH = path.join(\"/tmp\", \"jellyfin-config.json\");")

with open("server.ts", "w", encoding="utf-8") as f:
    f.write(content)
