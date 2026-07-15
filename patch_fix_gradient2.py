import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    '"james-bond": { url: "https://i.pinimg.com/236x/96/19/44/961944b5871a75672192deddd25fe830.jpg", style: { width: "40%", backgroundPosition: "center 20%" } }',
    '"james-bond": { url: "https://i.pinimg.com/236x/96/19/44/961944b5871a75672192deddd25fe830.jpg", style: { backgroundSize: "auto 120%", backgroundPosition: "right 20%" } }'
)

content = content.replace(
    '"mafia-movies": { url: "https://cdn.artphotolimited.com/images/60913d60bd40b85323893a87/1000x1000/al-pacino-super-star.jpg", style: { width: "45%", backgroundPosition: "center 25%", backgroundSize: "cover" } }',
    '"mafia-movies": { url: "https://cdn.artphotolimited.com/images/60913d60bd40b85323893a87/1000x1000/al-pacino-super-star.jpg", style: { backgroundSize: "auto 120%", backgroundPosition: "right 20%" } }'
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Patched successfully.")
