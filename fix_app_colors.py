with open('src/App.tsx', 'r') as f:
    text = f.read()

# Let's ensure the body matches the new bg color as well
text = text.replace('bg-black text-white font-sans', 'bg-stone-950 text-stone-100 font-sans')
text = text.replace('min-h-screen bg-black', 'min-h-screen bg-stone-950')

with open('src/App.tsx', 'w') as f:
    f.write(text)
