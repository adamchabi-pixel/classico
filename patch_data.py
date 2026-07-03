import re

with open("src/data.ts", "r") as f:
    content = f.read()

if "castDetails?:" not in content:
    content = content.replace("  cast: string[];", "  cast: string[];\n  castDetails?: { id: string; name: string; role?: string; imageUrl?: string; }[];")

with open("src/data.ts", "w") as f:
    f.write(content)
