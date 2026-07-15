import re

with open("server.ts", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("const CACHE_FILE = path.join(process.cwd(), \".json-cache.json\");", "const CACHE_FILE = path.join(\"/tmp\", \".json-cache.json\");")

with open("server.ts", "w", encoding="utf-8") as f:
    f.write(content)
