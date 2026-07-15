import re

with open("src/data.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Remove trending-now more aggressively
pattern = re.compile(r'\{\s*id:\s*"trending-now"[\s\S]*?(?=\{\s*id:\s*"(?:comedy-gold|christopher-nolan|star-wars|james-bond|rocky)")')
match = pattern.search(content)
if match:
    content = content.replace(match.group(0), "")

with open("src/data.ts", "w", encoding="utf-8") as f:
    f.write(content)
