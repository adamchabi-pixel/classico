with open('src/App.tsx', 'r') as f:
    text = f.read()

text = text.replace('Drame', 'Drama')
text = text.replace('Film de Culte', 'Cult Classic')

with open('src/App.tsx', 'w') as f:
    f.write(text)
