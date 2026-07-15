import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Tarantino to Scorsese
content = content.replace(
    '"tarantino-collection": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDZe6FkKBAg8o5bmQjh2R131IigXlgx7BuWIEBRHviZg&s=10", style: { backgroundPosition: "center 35%", backgroundSize: "cover" } },\n',
    ''
)
content = content.replace(
    '"director-quentin-tarantino": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDZe6FkKBAg8o5bmQjh2R131IigXlgx7BuWIEBRHviZg&s=10", style: { backgroundPosition: "center 35%", backgroundSize: "cover" } },',
    '"director-martin-scorsese": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDZe6FkKBAg8o5bmQjh2R131IigXlgx7BuWIEBRHviZg&s=10", style: { backgroundPosition: "center 35%", backgroundSize: "cover" } },'
)

# James Bond and Mafia - fix cropping on desktop
content = content.replace(
    '"james-bond": { url: "https://i.pinimg.com/236x/96/19/44/961944b5871a75672192deddd25fe830.jpg", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } }',
    '"james-bond": { url: "https://i.pinimg.com/236x/96/19/44/961944b5871a75672192deddd25fe830.jpg", style: { backgroundPosition: "right 20%", backgroundSize: "auto 120%" } }'
)
content = content.replace(
    '"mafia-movies": { url: "https://cdn.artphotolimited.com/images/60913d60bd40b85323893a87/1000x1000/al-pacino-super-star.jpg", style: { backgroundPosition: "center 35%", backgroundSize: "cover" } }',
    '"mafia-movies": { url: "https://cdn.artphotolimited.com/images/60913d60bd40b85323893a87/1000x1000/al-pacino-super-star.jpg", style: { backgroundPosition: "right 35%", backgroundSize: "auto 120%" } }'
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Patched successfully.")
