import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Christopher Nolan
content = content.replace(
    '"christopher-nolan": { url: "https://static.time.com/v3/assets/bltea6093859af6183b/blt1ea6b6a2f1266e7f/698a443b86f68e461e6f32b9/christopher-nolan-01.jpg?branch=production&width=3840&quality=75&auto=webp&crop=3:2" }',
    '"christopher-nolan": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRc5H0x-K46ZlLkDu716p_r0wF6YkbwUCDeYbdFyrbBY4rNGi8XGUHcRf4&s=10", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } }'
)
content = content.replace(
    '"director-christopher-nolan": { url: "https://static.time.com/v3/assets/bltea6093859af6183b/blt1ea6b6a2f1266e7f/698a443b86f68e461e6f32b9/christopher-nolan-01.jpg?branch=production&width=3840&quality=75&auto=webp&crop=3:2" }',
    '"director-christopher-nolan": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRc5H0x-K46ZlLkDu716p_r0wF6YkbwUCDeYbdFyrbBY4rNGi8XGUHcRf4&s=10", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } }'
)

# James Bond and Mafia - add mask images to fade quickly
content = content.replace(
    '"james-bond": { url: "https://i.pinimg.com/236x/96/19/44/961944b5871a75672192deddd25fe830.jpg", style: { backgroundPosition: "right 20%", backgroundSize: "auto 120%" } }',
    '"james-bond": { url: "https://i.pinimg.com/236x/96/19/44/961944b5871a75672192deddd25fe830.jpg", style: { backgroundPosition: "right 20%", backgroundSize: "auto 120%", WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 25%)", maskImage: "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 25%)" } }'
)
content = content.replace(
    '"mafia-movies": { url: "https://cdn.artphotolimited.com/images/60913d60bd40b85323893a87/1000x1000/al-pacino-super-star.jpg", style: { backgroundPosition: "right 35%", backgroundSize: "auto 120%" } }',
    '"mafia-movies": { url: "https://cdn.artphotolimited.com/images/60913d60bd40b85323893a87/1000x1000/al-pacino-super-star.jpg", style: { backgroundPosition: "right 35%", backgroundSize: "auto 120%", WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 25%)", maskImage: "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 25%)" } }'
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Patched successfully.")
