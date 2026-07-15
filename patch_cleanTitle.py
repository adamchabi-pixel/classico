import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_clean = """    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]/g, " ")     // replace punctuation with space
    .replace(/\s+/g, " ")           // collapse spaces
    .trim();"""

new_clean = """    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]/g, " ")     // replace punctuation with space
    .replace(/\s+/g, " ")           // collapse spaces
    .trim()
    .replace(/^(the|a|an|le|la|les|l)\s+/i, "");"""

content = content.replace(old_clean, new_clean)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
