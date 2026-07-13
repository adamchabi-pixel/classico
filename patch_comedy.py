import re

with open('src/data.ts', 'r') as f:
    text = f.read()

comedy_collection = """  {
    id: "comedy-gold",
    title: "Best Comedy Gold",
    description: "The most hilarious, iconic, and rewatchable comedy masterpieces of all time.",
    movies: [
      {
        id: "21-jump-street",
        title: "21 Jump Street",
        year: 2012,
        duration: "109 min",
        rating: "7.2",
        director: "Phil Lord, Christopher Miller",
        cast: ["Jonah Hill", "Channing Tatum", "Ice Cube"],
        genre: ["Action", "Comedy", "Crime"],
      },
      {
        id: "22-jump-street",
        title: "22 Jump Street",
        year: 2014,
        duration: "112 min",
        rating: "7.0",
        director: "Phil Lord, Christopher Miller",
        cast: ["Jonah Hill", "Channing Tatum", "Ice Cube"],
        genre: ["Action", "Comedy", "Crime"],
      },
      {
        id: "superbad",
        title: "Superbad",
        year: 2007,
        duration: "113 min",
        rating: "7.6",
        director: "Greg Mottola",
        cast: ["Jonah Hill", "Michael Cera", "Christopher Mintz-Plasse"],
        genre: ["Comedy"],
      },
      {
        id: "grown-ups",
        title: "Grown Ups",
        year: 2010,
        duration: "102 min",
        rating: "5.9",
        director: "Dennis Dugan",
        cast: ["Adam Sandler", "Kevin James", "Chris Rock"],
        genre: ["Comedy"],
      },
      {
        id: "white-chicks",
        title: "White Chicks",
        year: 2004,
        duration: "109 min",
        rating: "5.8",
        director: "Keenen Ivory Wayans",
        cast: ["Marlon Wayans", "Shawn Wayans", "Busy Philipps"],
        genre: ["Comedy", "Crime"],
      }
    ]
  },
"""

text = text.replace('export const COLLECTIONS: Collection[] = [', 'export const COLLECTIONS: Collection[] = [\n' + comedy_collection)

with open('src/data.ts', 'w') as f:
    f.write(text)
