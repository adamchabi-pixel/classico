import re

with open('server.ts', 'r') as f:
    content = f.read()

# Make getJellyfinConfig always return null
content = re.sub(r'function getJellyfinConfig\(\) \{[\s\S]*?\n\}', 'function getJellyfinConfig() {\n  return null;\n}', content)

with open('server.ts', 'w') as f:
    f.write(content)
