import re

with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace('app.get("/api/jellyfin/movies"', 'app.get("/api/movies"')
content = content.replace('app.get("/api/jellyfin/hero"', 'app.get("/api/hero"')
content = content.replace('app.post("/api/jellyfin/config"', 'app.post("/api/config"')
content = content.replace('app.post("/api/jellyfin/disconnect"', 'app.post("/api/disconnect"')

with open('server.ts', 'w') as f:
    f.write(content)
