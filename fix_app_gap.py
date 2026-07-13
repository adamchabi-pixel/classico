import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

text = text.replace(
    'className="flex gap-3 sm:gap-6 overflow-x-auto no-scrollbar py-2.5 px-1 pb-4"',
    'className={`flex overflow-x-auto no-scrollbar py-2.5 px-1 pb-4 ${collection.id === "trending-now" ? "gap-6 sm:gap-10" : "gap-3 sm:gap-6"}`}'
)

with open('src/App.tsx', 'w') as f:
    f.write(text)
