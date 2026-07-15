import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%", "rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Patched successfully.")
