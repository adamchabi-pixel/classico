import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Update maskImage in generic renderer to make it fade earlier
pattern_render = re.compile(r'maskImage: \'linear-gradient\(to left, rgba\(0,0,0,1\) 0%, rgba\(0,0,0,1\) 60%, rgba\(0,0,0,0\) 100%\)\'')
content = pattern_render.sub('maskImage: \'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 10%, rgba(0,0,0,0) 100%)\'', content)

pattern_webkit_render = re.compile(r'WebkitMaskImage: \'linear-gradient\(to left, rgba\(0,0,0,1\) 0%, rgba\(0,0,0,1\) 60%, rgba\(0,0,0,0\) 100%\)\'')
content = pattern_webkit_render.sub('WebkitMaskImage: \'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 10%, rgba(0,0,0,0) 100%)\'', content)

# Update COLLECTION_BANNERS
# Matrix
content = content.replace(
    '"matrix": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDZe6FkKBAg8o5bmQjh2R131IigXlgx7BuWIEBRHviZg&s=10" }',
    '"matrix": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWBBqq5C8VYKAjz47Tr-3NiJm7y3qWdAOLboYZragONQ&s=10", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } }'
)

# Mysteries
content = content.replace(
    '"mind-bending-mysteries": { url: "https://images.mubicdn.net/images/cast_member/3071/cache-3195-1568084972/image-w856.jpg" }',
    '"mind-bending-mysteries": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6b_7nHm_sAJZcyBiqyV2kcpJCnyuVbW9UgItvTJ3Yfj-22VZEM4REfozS&s=10", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } }'
)

# John Wick
content = content.replace(
    '"john-wick": { url: "https://cdn.prod.website-files.com/652e1d0f532c272ff40207d0/654a348668add8c89454af34_Chad%20Stahelski.jpg" }',
    '"john-wick": { url: "https://m.media-amazon.com/images/M/MV5BNDEzOTdhNDUtY2EyMy00YTNmLWE5MjItZmRjMmQzYTRlMGRkXkEyXkFqcGc@._V1_.jpg", style: { backgroundPosition: "center 30%", backgroundSize: "cover" } }'
)
content = content.replace(
    '"director-chad-stahelski": { url: "https://cdn.prod.website-files.com/652e1d0f532c272ff40207d0/654a348668add8c89454af34_Chad%20Stahelski.jpg" }',
    '"director-chad-stahelski": { url: "https://m.media-amazon.com/images/M/MV5BNDEzOTdhNDUtY2EyMy00YTNmLWE5MjItZmRjMmQzYTRlMGRkXkEyXkFqcGc@._V1_.jpg", style: { backgroundPosition: "center 30%", backgroundSize: "cover" } }'
)

# Fast and Furious
content = content.replace(
    '"fast-and-furious": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXrgAjZyB1A4tvs4McappxohGUnoaI7KI_CWGJV98pi5n-mw_Q8Ig8rBJT&s=10" }',
    '"fast-and-furious": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTffhTShcRs8T72xu1zz0SHS9ZG4r-XoXuCJ04-Z94EczGDthsuyDqtRVDj&s=10", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } }'
)

# Quentin Tarantino (if missing, add it, wait I should replace properly)
# But earlier I removed tarantino-collection to move it to scorsese. I will put it back for Tarantino since the user gave a new image.
# We will just inject it into the dictionary.

tarantino_str = '  "tarantino-collection": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWu6RRTNcMHTxff7uXa7H4Y8Qy8BKEHRovAvu3qr6byA&s=10", style: { backgroundPosition: "center 30%", backgroundSize: "cover" } },\n  "director-quentin-tarantino": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWu6RRTNcMHTxff7uXa7H4Y8Qy8BKEHRovAvu3qr6byA&s=10", style: { backgroundPosition: "center 30%", backgroundSize: "cover" } },'

# Comedy Gold & Mission Impossible
comedy_mi_str = '  "comedy-gold": { url: "https://m.media-amazon.com/images/M/MV5BMTUyNDU0NzAwNl5BMl5BanBnXkFtZTcwMzQxMzIzNw@@._V1_FMjpg_UX1000_.jpg", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } },\n  "mission-impossible": { url: "https://cdn.artphotolimited.com/images/66c89286e2e42e7046294521/1000x1000/tom-cruise.jpg", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } },'

# Find the end of the dictionary and inject new ones
dict_end_pattern = re.compile(r'(\s*)\};(\s*// -------------------------------------------------------------)')
match = dict_end_pattern.search(content)
if match:
    injection = ",\n" + tarantino_str + "\n" + comedy_mi_str + match.group(1) + "};" + match.group(2)
    content = content.replace(match.group(0), injection)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
