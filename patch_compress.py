import re

with open("server.ts", "r", encoding="utf-8") as f:
    content = f.read()

import_str = 'import compression from "compression";\n'
if "import compression" not in content:
    content = content.replace('import express from "express";', 'import express from "express";\n' + import_str)

if "app.use(compression())" not in content:
    content = content.replace('const app = express();', 'const app = express();\napp.use(compression());')

with open("server.ts", "w", encoding="utf-8") as f:
    f.write(content)
