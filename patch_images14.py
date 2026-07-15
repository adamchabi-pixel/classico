import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# mysteries - using cover to make sure the gradient mask works properly without a sharp edge
content = content.replace(
    '"mind-bending-mysteries": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUcFo5K5UW4vpxO-BJv_o30ZHXzRLAk8amHHrfVQZxEtHQZbGAnhMtGlHX&s=10", style: { backgroundPosition: "right 20%", backgroundSize: "auto 100%" } }',
    '"mind-bending-mysteries": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUcFo5K5UW4vpxO-BJv_o30ZHXzRLAk8amHHrfVQZxEtHQZbGAnhMtGlHX&s=10", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } }'
)

# fast and furious - fixing the key so it applies to the franchise
content = content.replace(
    '"fast-and-furious": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRW2U6THysy36omQs5Fvgny4eYYv_DNx47m5v-2LcGSHmlu2oRPI3DDhsCf&s=10", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } }',
    '"franchise-fast-and-furious": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRW2U6THysy36omQs5Fvgny4eYYv_DNx47m5v-2LcGSHmlu2oRPI3DDhsCf&s=10", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } }'
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Patched successfully.")
