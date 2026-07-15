import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace mafia
content = content.replace(
    '"mafia-movies": { url: "https://cdn.artphotolimited.com/images/60913d60bd40b85323893a87/1000x1000/al-pacino-super-star.jpg", style: { backgroundPosition: "right 35%", backgroundSize: "auto 120%", WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 150px, rgba(0,0,0,0) 350px)", maskImage: "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 150px, rgba(0,0,0,0) 350px)" } }',
    '"mafia-movies": { url: "https://media.newyorker.com/photos/5e70fef11785a2000935d0eb/master/w_2560%2Cc_limit/ra722.jpg", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } }'
)

# Replace James Bond
content = content.replace(
    '"james-bond": { url: "https://i.pinimg.com/236x/96/19/44/961944b5871a75672192deddd25fe830.jpg", style: { backgroundPosition: "right 20%", backgroundSize: "auto 120%", WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 150px, rgba(0,0,0,0) 350px)", maskImage: "linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 150px, rgba(0,0,0,0) 350px)" } }',
    '"james-bond": { url: "https://static.wikia.nocookie.net/jamesbond/images/8/81/James_Bond_%28Daniel_Craig%29_-_Profile.jpg/revision/latest?cb=20220103100438", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } }'
)

# Replace Christopher Nolan
content = content.replace(
    '"christopher-nolan": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRc5H0x-K46ZlLkDu716p_r0wF6YkbwUCDeYbdFyrbBY4rNGi8XGUHcRf4&s=10", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } }',
    '"christopher-nolan": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRc5H0x-K46ZlLkDu716p_r0wF6YkbwUCDeYbdFyrbBY4rNGi8XGUHcRf4&s=10", style: { backgroundPosition: "center top", backgroundSize: "cover" } }'
)
content = content.replace(
    '"director-christopher-nolan": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRc5H0x-K46ZlLkDu716p_r0wF6YkbwUCDeYbdFyrbBY4rNGi8XGUHcRf4&s=10", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } }',
    '"director-christopher-nolan": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRc5H0x-K46ZlLkDu716p_r0wF6YkbwUCDeYbdFyrbBY4rNGi8XGUHcRf4&s=10", style: { backgroundPosition: "center top", backgroundSize: "cover" } }'
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Patched successfully.")
