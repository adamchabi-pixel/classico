import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    '"mafia-movies": { url: "https://media.newyorker.com/photos/5e70fef11785a2000935d0eb/master/w_2560%2Cc_limit/ra722.jpg", style: { backgroundPosition: "right 30%", backgroundSize: "auto 100%" } }',
    '"mafia-movies": { url: "https://media.newyorker.com/photos/5e70fef11785a2000935d0eb/master/w_2560%2Cc_limit/ra722.jpg", style: { backgroundPosition: "center 10%", backgroundSize: "cover" } }'
)

content = content.replace(
    '"james-bond": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQs6ZTjPYjnbZ3oAbtNW8u6_veJCxj-cbRLmsurOrowjQ&s=10", style: { backgroundPosition: "right 20%", backgroundSize: "auto 100%" } }',
    '"james-bond": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQs6ZTjPYjnbZ3oAbtNW8u6_veJCxj-cbRLmsurOrowjQ&s=10", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } }'
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Patched successfully.")
