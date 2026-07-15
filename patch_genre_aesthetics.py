import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

pattern = re.compile(r'  "(tarantino-collection|director-quentin-tarantino|comedy-gold|franchise-mission-impossible)": \{ url:.*?\n', re.MULTILINE)
content = re.sub(pattern, "", content)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
