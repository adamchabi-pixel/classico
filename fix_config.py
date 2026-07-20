import sys

with open("src/App.tsx", "r") as f:
    content = f.read()

target = """      } finally {
        setIsJellyfinLoading(false);
        setIsJellyfinHeroLoading(false);
      }"""

replacement = """      } finally {
        setJellyfinConfig({ configured: true, url: "local" });
        setIsJellyfinLoading(false);
        setIsJellyfinHeroLoading(false);
      }"""

content = content.replace(target, replacement)

with open("src/App.tsx", "w") as f:
    f.write(content)
