import sys

with open("server.ts", "r") as f:
    content = f.read()

target = 'app.get("/api/movies", (req, res) => {'
replacement = 'app.get("/api/movies", (req, res) => {\n  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");\n  res.setHeader("Pragma", "no-cache");\n  res.setHeader("Expires", "0");'
content = content.replace(target, replacement)

target2 = 'app.get("/api/hero", (req, res) => {'
replacement2 = 'app.get("/api/hero", (req, res) => {\n  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");\n  res.setHeader("Pragma", "no-cache");\n  res.setHeader("Expires", "0");'
content = content.replace(target2, replacement2)

with open("server.ts", "w") as f:
    f.write(content)
