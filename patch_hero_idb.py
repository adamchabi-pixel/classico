import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace initialization
old_init = """  const [jellyfinHeroMovies, setJellyfinHeroMovies] = useState<any[]>([]);"""
new_init = """  const [jellyfinHeroMovies, setJellyfinHeroMovies] = useState<any[]>([]);

  useEffect(() => {
    get("classico_hero_cache").then((val) => {
      if (val && Array.isArray(val) && val.length > 0) {
        setJellyfinHeroMovies((prev) => prev.length === 0 ? val : prev);
      }
    }).catch(e => console.warn("IDB hero cache load failed:", e));
  }, []);"""
content = content.replace(old_init, new_init)

# Replace fetch saving
old_save = """          if (data.heroes && data.heroes.length > 0) {
            setJellyfinHeroMovies(data.heroes);
          } else if (data.hero) {
            setJellyfinHeroMovies([data.hero]);
          } else {
            setJellyfinHeroMovies([]);
          }"""
new_save = """          if (data.heroes && data.heroes.length > 0) {
            setJellyfinHeroMovies(data.heroes);
            try { set("classico_hero_cache", data.heroes); } catch(e) {}
          } else if (data.hero) {
            setJellyfinHeroMovies([data.hero]);
            try { set("classico_hero_cache", [data.hero]); } catch(e) {}
          } else {
            setJellyfinHeroMovies([]);
          }"""
content = content.replace(old_save, new_save)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
