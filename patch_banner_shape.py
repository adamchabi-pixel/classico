import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_class = 'className="relative overflow-hidden group bg-neutral-900/60 rounded-2xl border border-zinc-800/80 p-4 sm:p-8 flex flex-col justify-between gap-4 sm:gap-6 hover:border-amber-400/40 transition-all duration-300 text-left cursor-pointer"'

new_class = 'className="relative overflow-hidden group bg-neutral-900/60 rounded-2xl border border-zinc-800/80 p-4 sm:p-8 flex flex-col justify-between gap-4 sm:gap-6 hover:border-amber-400/40 transition-all duration-300 text-left cursor-pointer aspect-[16/9] sm:aspect-auto sm:min-h-[220px]"'

content = content.replace(old_class, new_class)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
