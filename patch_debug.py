import re
with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()
print("Perform auto-configuration on server" in content)
