import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    '"director-frank-darabont": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYkJ9a3HkUEPf9YprNRzIerQpqWEVCVuse1U_VDAVQhaTt1G74tCKxNQWj&s=10", style: { backgroundPosition: "center 30%", backgroundSize: "cover" } }',
    '"director-frank-darabont": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYkJ9a3HkUEPf9YprNRzIerQpqWEVCVuse1U_VDAVQhaTt1G74tCKxNQWj&s=10", style: { backgroundPosition: "right center", backgroundSize: "contain" } }'
)

content = content.replace(
    '"mind-bending-mysteries": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6b_7nHm_sAJZcyBiqyV2kcpJCnyuVbW9UgItvTJ3Yfj-22VZEM4REfozS&s=10", style: { backgroundPosition: "center top", backgroundSize: "cover" } }',
    '"mind-bending-mysteries": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6b_7nHm_sAJZcyBiqyV2kcpJCnyuVbW9UgItvTJ3Yfj-22VZEM4REfozS&s=10", style: { backgroundPosition: "right center", backgroundSize: "contain" } }'
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Patched successfully.")
