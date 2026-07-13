import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

old_unmatched = 'if (t.includes("bronx tale") || t.includes("il était une fois dans le bronx")) return false;'
new_unmatched = 'if (t.includes("bronx tale") || t.includes("il était une fois dans le bronx")) return false;\n      if (t.includes("21 jump street") || t.includes("22 jump street") || t.includes("superbad") || t.includes("grown ups") || t.includes("white chicks")) return false;\n      if (t.includes("memories of murder")) return false;'

text = text.replace(old_unmatched, new_unmatched)

with open('src/App.tsx', 'w') as f:
    f.write(text)
