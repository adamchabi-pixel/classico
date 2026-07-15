import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_clean = """  return t
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]/g, " ")     // replace punctuation with space
    .replace(/\\s+/g, " ")           // collapse spaces
    .trim();
  _cleanTitleCache.set(title, t);
  return t;"""

new_clean = """  const result = t
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]/g, " ")     // replace punctuation with space
    .replace(/\\s+/g, " ")           // collapse spaces
    .trim();
  _cleanTitleCache.set(title, result);
  return result;"""

content = content.replace(old_clean, new_clean)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
