import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

def repl_sw(m):
    return '{c.id === "star-wars" && (\n                        <div \n                          className="absolute right-[-80px] sm:right-[-160px] bottom-0 top-0 w-[60%] sm:w-[50%] opacity-30 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none bg-no-repeat bg-right bg-cover"'

def repl_rocky(m):
    return '{c.id === "rocky" && (\n                        <div \n                          className="absolute right-[-120px] sm:right-[-240px] bottom-0 top-0 w-[60%] sm:w-[50%] opacity-30 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none bg-no-repeat bg-right bg-cover"'

def repl_bond(m):
    return '{c.id === "james-bond" && (\n                        <div \n                          className="absolute right-[-80px] sm:right-[-160px] bottom-0 top-0 w-[60%] sm:w-[50%] opacity-30 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none bg-no-repeat bg-right bg-cover"'

content = re.sub(r'{\s*c\.id === "star-wars" && \([\s\S]*?className="[^"]+"', repl_sw, content)
content = re.sub(r'{\s*c\.id === "rocky" && \([\s\S]*?className="[^"]+"', repl_rocky, content)
content = re.sub(r'{\s*c\.id === "james-bond" && \([\s\S]*?className="[^"]+"', repl_bond, content)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Patched successfully.")
