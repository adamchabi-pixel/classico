import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# mysteries
content = content.replace(
    '"mind-bending-mysteries": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6b_7nHm_sAJZcyBiqyV2kcpJCnyuVbW9UgItvTJ3Yfj-22VZEM4REfozS&s=10", style: { backgroundPosition: "right center", backgroundSize: "contain" } }',
    '"mind-bending-mysteries": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUcFo5K5UW4vpxO-BJv_o30ZHXzRLAk8amHHrfVQZxEtHQZbGAnhMtGlHX&s=10", style: { backgroundPosition: "right 20%", backgroundSize: "auto 100%" } }'
)

# martin scorsese
content = content.replace(
    '"director-martin-scorsese": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDZe6FkKBAg8o5bmQjh2R131IigXlgx7BuWIEBRHviZg&s=10", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } }',
    '"director-martin-scorsese": { url: "https://awardsradar.com/wp-content/uploads/2022/04/Scorsese.jpeg", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } }'
)

# frank darabont
content = content.replace(
    '"director-frank-darabont": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYkJ9a3HkUEPf9YprNRzIerQpqWEVCVuse1U_VDAVQhaTt1G74tCKxNQWj&s=10", style: { backgroundPosition: "right center", backgroundSize: "contain" } }',
    '"director-frank-darabont": { url: "https://www.univision.com/_next/image?url=https%3A%2F%2Fuvn-brightspot.s3.amazonaws.com%2Fassets%2Fvixes%2Fg%2Fgettyimages-459214306.jpg&w=1280&q=75", style: { backgroundPosition: "right 20%", backgroundSize: "auto 100%" } }'
)

# fast and furious
content = content.replace(
    '"fast-and-furious": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTffhTShcRs8T72xu1zz0SHS9ZG4r-XoXuCJ04-Z94EczGDthsuyDqtRVDj&s=10", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } }',
    '"fast-and-furious": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRW2U6THysy36omQs5Fvgny4eYYv_DNx47m5v-2LcGSHmlu2oRPI3DDhsCf&s=10", style: { backgroundPosition: "center 20%", backgroundSize: "cover" } }'
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Patched successfully.")
