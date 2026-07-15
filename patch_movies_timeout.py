import re

with open("server.ts", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("async function fetchWithTimeout(url: string, options: any = {}, timeoutMs: number = 15000) {", "async function fetchWithTimeout(url: string, options: any = {}, timeoutMs: number = 60000) {")

with open("server.ts", "w", encoding="utf-8") as f:
    f.write(content)
