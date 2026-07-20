import sys
import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# We want to replace the whole checkJellyfinSetup function.
start_str = "const checkJellyfinSetup = async () => {"
end_str = "    checkJellyfinSetup();\n  }, []);"

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    new_func = """const checkJellyfinSetup = async () => {
      setIsJellyfinLoading(true);
      setIsJellyfinHeroLoading(true);
      try {
        const [libRes, heroRes] = await Promise.all([
          fetch("/api/movies"),
          fetch("/api/hero")
        ]);
        const libData = await libRes.json();
        const heroData = await heroRes.json();
        if (libData.success) {
          setJellyfinMovies(libData.movies || []);
        }
        if (heroData.success) {
          setJellyfinHeroMovies(heroData.heroes || []);
        }
        setJellyfinConfig({ configured: true, url: "local" });
      } catch (err) {
        console.error(err);
      } finally {
        setIsJellyfinLoading(false);
        setIsJellyfinHeroLoading(false);
      }
    };
"""
    content = content[:start_idx] + new_func + content[end_idx:]

    with open("src/App.tsx", "w") as f:
        f.write(content)
    print("Patched successfully")
else:
    print("Not found")
