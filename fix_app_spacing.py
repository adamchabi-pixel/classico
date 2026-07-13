import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

text = text.replace('gap-3 sm:gap-6', 'gap-4 sm:gap-8')

with open('src/App.tsx', 'w') as f:
    f.write(text)
