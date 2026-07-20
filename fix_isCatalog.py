import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = re.sub(r'\s*isCatalog:\s*true,', '', content)
content = re.sub(r'heroTouchStartX', 'heroTouchStartX', content) # dummy

with open('src/App.tsx', 'w') as f:
    f.write(content)
