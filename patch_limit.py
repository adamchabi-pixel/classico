import re

with open("server.ts", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("limit=10000", "limit=2000")

with open("server.ts", "w", encoding="utf-8") as f:
    f.write(content)
