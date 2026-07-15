import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

def update_pos(old, new, text):
    return text.replace(old, new)

# Rush Hour
content = update_pos(
    '"director-brett-ratner": { url: "https://image.tmdb.org/t/p/w500/nraZoTzwJQPHspAVsKfgl3RXKKa.jpg", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } }',
    '"director-brett-ratner": { url: "https://image.tmdb.org/t/p/w500/nraZoTzwJQPHspAVsKfgl3RXKKa.jpg", style: { backgroundPosition: "center 40%", backgroundSize: "cover" } }',
    content
)

# Frank Darabont
content = update_pos(
    '"director-frank-darabont": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYkJ9a3HkUEPf9YprNRzIerQpqWEVCVuse1U_VDAVQhaTt1G74tCKxNQWj&s=10", style: { backgroundPosition: "center 25%", backgroundSize: "cover" } }',
    '"director-frank-darabont": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYkJ9a3HkUEPf9YprNRzIerQpqWEVCVuse1U_VDAVQhaTt1G74tCKxNQWj&s=10", style: { backgroundPosition: "center 30%", backgroundSize: "cover" } }',
    content
)

# Quentin Tarantino
content = update_pos(
    '"tarantino-collection": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDZe6FkKBAg8o5bmQjh2R131IigXlgx7BuWIEBRHviZg&s=10", style: { backgroundPosition: "center 25%", backgroundSize: "cover" } }',
    '"tarantino-collection": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDZe6FkKBAg8o5bmQjh2R131IigXlgx7BuWIEBRHviZg&s=10", style: { backgroundPosition: "center 35%", backgroundSize: "cover" } }',
    content
)
content = update_pos(
    '"director-quentin-tarantino": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDZe6FkKBAg8o5bmQjh2R131IigXlgx7BuWIEBRHviZg&s=10", style: { backgroundPosition: "center 25%", backgroundSize: "cover" } }',
    '"director-quentin-tarantino": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDZe6FkKBAg8o5bmQjh2R131IigXlgx7BuWIEBRHviZg&s=10", style: { backgroundPosition: "center 35%", backgroundSize: "cover" } }',
    content
)

# Mafia
content = update_pos(
    '"mafia-movies": { url: "https://cdn.artphotolimited.com/images/60913d60bd40b85323893a87/1000x1000/al-pacino-super-star.jpg", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } }',
    '"mafia-movies": { url: "https://cdn.artphotolimited.com/images/60913d60bd40b85323893a87/1000x1000/al-pacino-super-star.jpg", style: { backgroundPosition: "center 35%", backgroundSize: "cover" } }',
    content
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Patched successfully.")
