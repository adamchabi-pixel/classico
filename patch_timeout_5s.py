import re

with open("server.ts", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("timeoutMs: number = 2500", "timeoutMs: number = 5500")

with open("server.ts", "w", encoding="utf-8") as f:
    f.write(content)
