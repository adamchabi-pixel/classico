import re

with open('src/data.ts', 'r') as f:
    content = f.read()

content = re.sub(r'isJellyfin\?: boolean;', 'isIframeEmbed?: boolean;\n  iframeSrc?: string;\n  isCatalog?: boolean;', content)

with open('src/data.ts', 'w') as f:
    f.write(content)
