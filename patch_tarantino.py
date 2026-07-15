import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    '"tarantino-collection": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDZe6FkKBAg8o5bmQjh2R131IigXlgx7BuWIEBRHviZg&s=10", style: { backgroundPosition: "center 10%" } }',
    '"tarantino-collection": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDZe6FkKBAg8o5bmQjh2R131IigXlgx7BuWIEBRHviZg&s=10", style: { backgroundPosition: "center top" } }'
)

content = content.replace(
    '"director-quentin-tarantino": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDZe6FkKBAg8o5bmQjh2R131IigXlgx7BuWIEBRHviZg&s=10", style: { backgroundPosition: "center 10%" } }',
    '"director-quentin-tarantino": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDZe6FkKBAg8o5bmQjh2R131IigXlgx7BuWIEBRHviZg&s=10", style: { backgroundPosition: "center top" } }'
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Patched successfully.")
