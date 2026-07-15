import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Collections Grid Layout cards
content = content.replace(
    'className="grid grid-cols-2 gap-3 sm:gap-8 pt-2"',
    'className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-8 pt-2"'
)

# Movies inside selected collection
content = content.replace(
    'className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-8 justify-items-center"',
    'className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-8 justify-items-center"'
)

# History grid
content = content.replace(
    'className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-8 justify-items-center"',
    'className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-8 justify-items-center"'
)

# Search grid
content = content.replace(
    'className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-8 pt-2 justify-items-center"',
    'className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-8 pt-2 justify-items-center"'
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
