import sys
import re

with open("src/App.tsx", "r") as f:
    content = f.read()

target = r'const checkJellyfinSetup = async \(\) => \{.*?checkJellyfinSetup\(\);\n  \}, \[\]\);'

replacement = """const checkJellyfinSetup = async () => {
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
    checkJellyfinSetup();
  }, []);"""

content = re.sub(target, replacement, content, flags=re.DOTALL)

with open("src/App.tsx", "w") as f:
    f.write(content)
