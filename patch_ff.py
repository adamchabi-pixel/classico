import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    '"fast-and-furious": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRW2U6THysy36omQs5Fvgny4eYYv_DNx47m5v-2LcGSHmlu2oRPI3DDhsCf&s=10", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } },',
    '"fast-and-furious": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRW2U6THysy36omQs5Fvgny4eYYv_DNx47m5v-2LcGSHmlu2oRPI3DDhsCf&s=10", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } },\n  "franchise-fast-and-furious": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRW2U6THysy36omQs5Fvgny4eYYv_DNx47m5v-2LcGSHmlu2oRPI3DDhsCf&s=10", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } },'
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
