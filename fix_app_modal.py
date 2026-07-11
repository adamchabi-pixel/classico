with open('src/App.tsx', 'r') as f:
    text = f.read()

text = text.replace('<MovieModal\n        movie={selectedMovie}\n        onClose', '<MovieModal\n        movie={selectedMovie}\n        onPlay={(id) => navigateTo("/player/" + id)}\n        onClose')

with open('src/App.tsx', 'w') as f:
    f.write(text)
