import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Mysteries: dezoom un peu
content = content.replace(
    '"mind-bending-mysteries": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6b_7nHm_sAJZcyBiqyV2kcpJCnyuVbW9UgItvTJ3Yfj-22VZEM4REfozS&s=10", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } }',
    '"mind-bending-mysteries": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6b_7nHm_sAJZcyBiqyV2kcpJCnyuVbW9UgItvTJ3Yfj-22VZEM4REfozS&s=10", style: { backgroundPosition: "center 20%", backgroundSize: "auto 80%" } }'
)

# 2. the batman and matrix
# The user wants batman: https://w0.peakpx.com/wallpaper/921/848/HD-wallpaper-christian-bale-batman-cool-movie-actor.jpg
# And matrix: https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWBBqq5C8VYKAjz47Tr-3NiJm7y3qWdAOLboYZragONQ&s=10
content = content.replace(
    '"batman": { url: "https://w0.peakpx.com/wallpaper/921/848/HD-wallpaper-christian-bale-batman-cool-movie-actor.jpg" },',
    '"the-batman": { url: "https://w0.peakpx.com/wallpaper/921/848/HD-wallpaper-christian-bale-batman-cool-movie-actor.jpg", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } },'
)
content = content.replace(
    '"franchise-batman": { url: "https://w0.peakpx.com/wallpaper/921/848/HD-wallpaper-christian-bale-batman-cool-movie-actor.jpg" },',
    ''
)
content = content.replace(
    '"matrix": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWBBqq5C8VYKAjz47Tr-3NiJm7y3qWdAOLboYZragONQ&s=10", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } },',
    '"franchise-matrix": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWBBqq5C8VYKAjz47Tr-3NiJm7y3qWdAOLboYZragONQ&s=10", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } },\n  "matrix": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWBBqq5C8VYKAjz47Tr-3NiJm7y3qWdAOLboYZragONQ&s=10", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } },'
)

# 3. mission impossible
content = content.replace(
    '"mission-impossible": { url: "https://cdn.artphotolimited.com/images/66c89286e2e42e7046294521/1000x1000/tom-cruise.jpg", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } }',
    '"franchise-mission-impossible": { url: "https://cdn.artphotolimited.com/images/66c89286e2e42e7046294521/1000x1000/tom-cruise.jpg", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } }'
)

# 4. mafia
content = content.replace(
    '"mafia-movies": { url: "https://media.newyorker.com/photos/5e70fef11785a2000935d0eb/master/w_2560%2Cc_limit/ra722.jpg", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } }',
    '"mafia-movies": { url: "https://media.newyorker.com/photos/5e70fef11785a2000935d0eb/master/w_2560%2Cc_limit/ra722.jpg", style: { backgroundPosition: "right 30%", backgroundSize: "auto 100%" } }'
)

# 5. james bond
content = content.replace(
    '"james-bond": { url: "https://static.wikia.nocookie.net/jamesbond/images/8/81/James_Bond_%28Daniel_Craig%29_-_Profile.jpg/revision/latest?cb=20220103100438", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } }',
    '"james-bond": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQs6ZTjPYjnbZ3oAbtNW8u6_veJCxj-cbRLmsurOrowjQ&s=10", style: { backgroundPosition: "right 20%", backgroundSize: "auto 100%" } }'
)

# In case I didn't match the override from before for mafia and james bond, they might still have maskImage. Let's make sure.
# Wait, they don't have maskImage right now because in patch_images7.py I replaced them with just backgroundPosition and backgroundSize!
# So they are using the default mask.
# I just need to make sure their URL and styling is correct.

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Patched successfully.")
