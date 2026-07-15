import re

with open("src/data.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Add gradient to memories-of-murder
old_memories = """        id: "memories-of-murder",
        title: "Memories of Murder",
        posterUrl: "https://image.tmdb.org/t/p/w500/q3uYq9b2z3GZq2D5O9E5Q8O5O5O.jpg",
        originalTitle: "Salinui chueok",
        year: 2003,
        duration: "131 min",
        rating: "8.1",
        director: "Bong Joon Ho",
        cast: ["Song Kang-ho", "Kim Sang-kyung", "Kim Roe-ha"],
        genre: ["Crime", "Drama", "Mystery"],
      },"""

new_memories = """        id: "memories-of-murder",
        title: "Memories of Murder",
        posterUrl: "https://image.tmdb.org/t/p/w500/q3uYq9b2z3GZq2D5O9E5Q8O5O5O.jpg",
        originalTitle: "Salinui chueok",
        year: 2003,
        duration: "131 min",
        rating: "8.1",
        director: "Bong Joon Ho",
        cast: ["Song Kang-ho", "Kim Sang-kyung", "Kim Roe-ha"],
        genre: ["Crime", "Drama", "Mystery"],
        gradient: "from-slate-900 via-zinc-900 to-indigo-950/40",
      },"""

content = content.replace(old_memories, new_memories)

with open("src/data.ts", "w", encoding="utf-8") as f:
    f.write(content)

print("Gradient added to memories-of-murder")
