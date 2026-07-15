import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Adjust Brett Ratner (Rush Hour)
content = content.replace(
    '"director-brett-ratner": { url: "https://image.tmdb.org/t/p/w500/nraZoTzwJQPHspAVsKfgl3RXKKa.jpg" }',
    '"director-brett-ratner": { url: "https://image.tmdb.org/t/p/w500/nraZoTzwJQPHspAVsKfgl3RXKKa.jpg", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } }'
)

# Adjust Frank Darabont
content = content.replace(
    '"director-frank-darabont": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYkJ9a3HkUEPf9YprNRzIerQpqWEVCVuse1U_VDAVQhaTt1G74tCKxNQWj&s=10" }',
    '"director-frank-darabont": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYkJ9a3HkUEPf9YprNRzIerQpqWEVCVuse1U_VDAVQhaTt1G74tCKxNQWj&s=10", style: { backgroundPosition: "center 25%", backgroundSize: "cover" } }'
)

# Adjust Quentin Tarantino
content = content.replace(
    '"tarantino-collection": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDZe6FkKBAg8o5bmQjh2R131IigXlgx7BuWIEBRHviZg&s=10", style: { backgroundPosition: "center top" } }',
    '"tarantino-collection": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDZe6FkKBAg8o5bmQjh2R131IigXlgx7BuWIEBRHviZg&s=10", style: { backgroundPosition: "center 25%", backgroundSize: "cover" } }'
)

content = content.replace(
    '"director-quentin-tarantino": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDZe6FkKBAg8o5bmQjh2R131IigXlgx7BuWIEBRHviZg&s=10", style: { backgroundPosition: "center top" } }',
    '"director-quentin-tarantino": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDZe6FkKBAg8o5bmQjh2R131IigXlgx7BuWIEBRHviZg&s=10", style: { backgroundPosition: "center 25%", backgroundSize: "cover" } }'
)

# Adjust Mafia
content = content.replace(
    '"mafia-movies": { url: "https://cdn.artphotolimited.com/images/60913d60bd40b85323893a87/1000x1000/al-pacino-super-star.jpg", style: { width: "45%", backgroundPosition: "center 10%" } }',
    '"mafia-movies": { url: "https://cdn.artphotolimited.com/images/60913d60bd40b85323893a87/1000x1000/al-pacino-super-star.jpg", style: { width: "45%", backgroundPosition: "center 25%", backgroundSize: "cover" } }'
)


with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Patched successfully.")
