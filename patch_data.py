import re

with open('src/data.ts', 'r') as f:
    text = f.read()

bronx_tale_movie = """      {
        id: "bronx-tale",
        title: "A Bronx Tale",
        originalTitle: "A Bronx Tale",
        year: 1993,
        duration: "121 min",
        rating: "7.8",
        director: "Robert De Niro",
        cast: ["Robert De Niro", "Chazz Palminteri", "Lillo Brancato"],
        genre: ["Crime", "Drama"],
      },"""

# Insert into Mafia
# Find Goodfellas in Mafia to insert after
text = text.replace('title: "Goodfellas",', f'title: "Goodfellas",\n{bronx_tale_movie}', 1)

memories_movie = """      {
        id: "memories-of-murder",
        title: "Memories of Murder",
        originalTitle: "Salinui chueok",
        year: 2003,
        duration: "131 min",
        rating: "8.1",
        director: "Bong Joon Ho",
        cast: ["Song Kang-ho", "Kim Sang-kyung", "Kim Roe-ha"],
        genre: ["Crime", "Drama", "Mystery"],
      },"""

# Insert into Mysteries
# Find Se7en in Mysteries to insert after
text = text.replace('title: "Se7en",', f'title: "Se7en",\n{memories_movie}', 1)

with open('src/data.ts', 'w') as f:
    f.write(text)
