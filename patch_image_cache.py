import re

with open("server.ts", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("const IMAGE_CACHE_DIR = path.join(process.cwd(), \".image-cache\");", "const IMAGE_CACHE_DIR = path.join(\"/tmp\", \".image-cache\");")

with open("server.ts", "w", encoding="utf-8") as f:
    f.write(content)
