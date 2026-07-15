import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    '"christopher-nolan": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRc5H0x-K46ZlLkDu716p_r0wF6YkbwUCDeYbdFyrbBY4rNGi8XGUHcRf4&s=10", style: { backgroundPosition: "center top", backgroundSize: "cover" } }',
    '"christopher-nolan": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRc5H0x-K46ZlLkDu716p_r0wF6YkbwUCDeYbdFyrbBY4rNGi8XGUHcRf4&s=10", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } }'
)
content = content.replace(
    '"director-christopher-nolan": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRc5H0x-K46ZlLkDu716p_r0wF6YkbwUCDeYbdFyrbBY4rNGi8XGUHcRf4&s=10", style: { backgroundPosition: "center top", backgroundSize: "cover" } }',
    '"director-christopher-nolan": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRc5H0x-K46ZlLkDu716p_r0wF6YkbwUCDeYbdFyrbBY4rNGi8XGUHcRf4&s=10", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } }'
)

content = content.replace(
    '"mafia-movies": { url: "https://media.newyorker.com/photos/5e70fef11785a2000935d0eb/master/w_2560%2Cc_limit/ra722.jpg", style: { backgroundPosition: "center 10%", backgroundSize: "cover" } }',
    '"mafia-movies": { url: "https://media.newyorker.com/photos/5e70fef11785a2000935d0eb/master/w_2560%2Cc_limit/ra722.jpg", style: { backgroundPosition: "center 25%", backgroundSize: "cover" } }'
)

content = content.replace(
    '"director-martin-scorsese": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDZe6FkKBAg8o5bmQjh2R131IigXlgx7BuWIEBRHviZg&s=10", style: { backgroundPosition: "center 35%", backgroundSize: "cover" } }',
    '"director-martin-scorsese": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDZe6FkKBAg8o5bmQjh2R131IigXlgx7BuWIEBRHviZg&s=10", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } }'
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Patched successfully.")
