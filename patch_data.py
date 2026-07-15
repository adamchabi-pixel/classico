import re

with open("src/data.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Remove trending-now
pattern = re.compile(r'\s*\{\s*id: "trending-now"[\s\S]*?(?=\s*\{\s*id: ")|(?=\s*\];)')
match = pattern.search(content)
if match:
    content = content.replace(match.group(0), "")

# Add mission-impossible at the end of collections array
mission_impossible = """  },
  {
    id: "mission-impossible",
    title: "Mission: Impossible",
    description: "Ethan Hunt and the IMF team take on their most impossible missions.",
    movies: [
      {
        id: "mi1",
        title: "Mission: Impossible",
        year: 1996,
        duration: "1h 50m",
        rating: "PG-13",
        director: "Brian De Palma",
        cast: ["Tom Cruise", "Jon Voight", "Emmanuelle Béart"],
        genre: ["Action", "Thriller", "Adventure"],
        description: "An American agent, under false suspicion of disloyalty, must discover and expose the real spy without the help of his organization.",
        gradient: "from-blue-900 to-black",
        accentColor: "text-blue-400 border-blue-400",
        posterUrl: "https://image.tmdb.org/t/p/w500/1ZVOBKwsHDBAwaD5AENyLkaZkBo.jpg"
      },
      {
        id: "mi-fallout",
        title: "Mission: Impossible - Fallout",
        year: 2018,
        duration: "2h 27m",
        rating: "PG-13",
        director: "Christopher McQuarrie",
        cast: ["Tom Cruise", "Henry Cavill", "Ving Rhames"],
        genre: ["Action", "Thriller", "Adventure"],
        description: "Ethan Hunt and his IMF team, along with some familiar allies, race against time after a mission gone wrong.",
        gradient: "from-neutral-800 to-black",
        accentColor: "text-neutral-400 border-neutral-400",
        posterUrl: "https://image.tmdb.org/t/p/w500/AkJQpZp9XIOWMDWehks8N4GIEtX.jpg"
      }
    ]
  }"""
content = re.sub(r'\s*\}\s*\];', mission_impossible + '\n];', content)

with open("src/data.ts", "w", encoding="utf-8") as f:
    f.write(content)
