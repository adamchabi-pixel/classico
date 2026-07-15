import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_block = """            } else {
              setIsJellyfinError("Failed to communicate with media server.");
            }"""

new_block = """            } else {
              const errText = await libRes.text().catch(()=>"");
              console.error("libRes not ok:", libRes.status, errText);
              setIsJellyfinError("Failed to communicate with media server.");
            }"""

content = content.replace(old_block, new_block)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
