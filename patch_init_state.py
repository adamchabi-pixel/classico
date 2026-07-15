import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

pattern = re.compile(r'  const \[jellyfinMovies, setJellyfinMovies\] = useState<Movie\[\]>\(\[\]\);')
new_str = """  const [jellyfinMovies, setJellyfinMovies] = useState<Movie[]>(() => {
    try {
      const cached = localStorage.getItem("classico_movies_cache");
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });"""

content = re.sub(pattern, new_str, content)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
