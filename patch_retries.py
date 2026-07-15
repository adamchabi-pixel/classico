import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("const maxAttempts = 3;", "const maxAttempts = 1;")
content = content.replace("let attempts = 0;", "let attempts = 0; // fast fail")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
