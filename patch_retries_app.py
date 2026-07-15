import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("let attempts = 0; // fast fail", "let attempts = 0;")
content = content.replace("const maxAttempts = 1;", "const maxAttempts = 3;")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
