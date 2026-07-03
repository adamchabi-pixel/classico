import re
import json

with open("src/data.ts", "r") as f:
    content = f.read()

# 1. Add Godfather 2, 3, Irishman, American Gangster to Mafia (id: "mafia-movies")
mafia_movies_add = """      },
      {
        id: "godfather-2",
        title: "The Godfather Part II",
        year: 1974,
        duration: "202 min",
        rating: "9.0",
        director: "Francis Ford Coppola",
        cast: ["Al Pacino", "Robert De Niro", "Robert Duvall", "Diane Keaton"],
        genre: ["Crime", "Drama"],
        description: "L'histoire de la famille Corleone continue avec Vito Corleone construisant son empire et Michael Corleone le gérant dans les années 1950.",
        gradient: "from-amber-950 via-stone-900 to-black",
        accentColor: "text-amber-500 border-amber-500/30 bg-amber-500/10",
        accentHex: "#f59e0b",
        symbol: "🌹🥃🔫",
        tagline: "Gardez vos amis proches, mais vos ennemis encore plus proches."
      },
      {
        id: "godfather-3",
        title: "The Godfather Part III",
        year: 1990,
        duration: "162 min",
        rating: "7.6",
        director: "Francis Ford Coppola",
        cast: ["Al Pacino", "Diane Keaton", "Andy Garcia", "Talia Shire"],
        genre: ["Crime", "Drama"],
        description: "Michael Corleone tente de légitimer les affaires de sa famille, mais est rattrapé par les péchés de son passé.",
        gradient: "from-amber-950 via-stone-900 to-black",
        accentColor: "text-amber-500 border-amber-500/30 bg-amber-500/10",
        accentHex: "#f59e0b",
        symbol: "🌹🥃🔫",
        tagline: "Juste au moment où je pensais être dehors... ils me ramènent dedans."
      },
      {
        id: "irishman",
        title: "The Irishman",
        year: 2019,
        duration: "209 min",
        rating: "7.8",
        director: "Martin Scorsese",
        cast: ["Robert De Niro", "Al Pacino", "Joe Pesci", "Harvey Keitel"],
        genre: ["Biography", "Crime", "Drama"],
        description: "Frank Sheeran, un ancien combattant de la Seconde Guerre mondiale, escroc et tueur à gages, revient sur son passé.",
        gradient: "from-zinc-900 via-neutral-900 to-stone-950",
        accentColor: "text-zinc-400 border-zinc-400/30 bg-zinc-400/10",
        accentHex: "#a1a1aa",
        symbol: "🇮🇪🔫👴",
        tagline: "J'ai entendu dire que tu peignais des maisons."
      },
      {
        id: "american-gangster",
        title: "American Gangster",
        year: 2007,
        duration: "157 min",
        rating: "7.8",
        director: "Ridley Scott",
        cast: ["Denzel Washington", "Russell Crowe", "Chiwetel Ejiofor", "Josh Brolin"],
        genre: ["Biography", "Crime", "Drama"],
        description: "Un flic de New York est chargé de faire tomber le plus grand baron de la drogue de la ville.",
        gradient: "from-stone-900 via-neutral-900 to-black",
        accentColor: "text-stone-400 border-stone-400/30 bg-stone-400/10",
        accentHex: "#a8a29e",
        symbol: "🚔❄️💰",
        tagline: "Il y a des flics pourris, et des gangsters honnêtes."
      },"""

# We'll insert it right after goodfellas (id: "goodfellas") closing bracket
# The file has:
#         tagline: "Aussi loin que je me souvienne, j'ai toujours voulu être un gangster."
#       },
target = 'tagline: "Le monde est à toi."\n      },'
if target in content:
    content = content.replace(target, target + "\n" + mafia_movies_add[11:])
else:
    print("Could not find Mafia replace target")


# 2. Add The Batman collection
batman_collection = """  {
    id: "the-batman",
    title: "The Batman",
    description: "Le Chevalier Noir défend Gotham City contre le crime et la corruption.",
    movies: [
      {
        id: "batman-begins",
        title: "Batman Begins",
        year: 2005,
        duration: "140 min",
        rating: "8.2",
        director: "Christopher Nolan",
        cast: ["Christian Bale", "Michael Caine", "Liam Neeson", "Katie Holmes"],
        genre: ["Action", "Crime", "Drama"],
        description: "Après s'être entraîné avec son mentor, Bruce Wayne entame son combat pour libérer Gotham City de la corruption.",
        gradient: "from-zinc-950 via-neutral-900 to-black",
        accentColor: "text-zinc-500 border-zinc-500/30 bg-zinc-500/10",
        accentHex: "#71717a",
        symbol: "🦇🌃🥷",
        tagline: "Le mythe commence."
      },
      {
        id: "the-dark-knight",
        title: "The Dark Knight",
        year: 2008,
        duration: "152 min",
        rating: "9.0",
        director: "Christopher Nolan",
        cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart", "Michael Caine"],
        genre: ["Action", "Crime", "Drama"],
        description: "Lorsque la menace connue sous le nom du Joker sème le chaos sur les habitants de Gotham, Batman doit accepter l'un des plus grands tests psychologiques et physiques de sa capacité à combattre l'injustice.",
        gradient: "from-zinc-900 via-neutral-900 to-black",
        accentColor: "text-purple-500 border-purple-500/30 bg-purple-500/10",
        accentHex: "#a855f7",
        symbol: "🦇🃏🔥",
        tagline: "Pourquoi cet air si sérieux ?"
      },
      {
        id: "the-dark-knight-rises",
        title: "The Dark Knight Rises",
        year: 2012,
        duration: "164 min",
        rating: "8.4",
        director: "Christopher Nolan",
        cast: ["Christian Bale", "Tom Hardy", "Anne Hathaway", "Gary Oldman"],
        genre: ["Action", "Crime", "Drama"],
        description: "Huit ans après les événements du Joker, le terroriste Bane force Bruce Wayne à reprendre du service en tant que Batman.",
        gradient: "from-stone-900 via-neutral-900 to-black",
        accentColor: "text-stone-400 border-stone-400/30 bg-stone-400/10",
        accentHex: "#a8a29e",
        symbol: "🦇💪🔥",
        tagline: "La fin d'une légende."
      },
      {
        id: "the-batman-2022",
        title: "The Batman",
        year: 2022,
        duration: "176 min",
        rating: "7.8",
        director: "Matt Reeves",
        cast: ["Robert Pattinson", "Zoë Kravitz", "Paul Dano", "Colin Farrell"],
        genre: ["Action", "Crime", "Drama"],
        description: "Lorsqu'un tueur en série s'attaque à l'élite de Gotham avec une série d'intrigues sadiques, une piste d'indices cryptiques envoie le plus grand détective du monde dans une enquête.",
        gradient: "from-red-950/40 via-neutral-900 to-black",
        accentColor: "text-red-600 border-red-600/30 bg-red-600/10",
        accentHex: "#dc2626",
        symbol: "🦇❓🌧️",
        tagline: "Démasquez la vérité."
      }
    ]
  },"""

# Insert before the closing bracket of COLLECTIONS
# In data.ts it ends with:
#     ]
#   }
# ];
insert_idx = content.rfind("  }\n];")
if insert_idx != -1:
    content = content[:insert_idx] + batman_collection + "\n" + content[insert_idx:]
else:
    print("Could not find Batman replace target")

with open("src/data.ts", "w") as f:
    f.write(content)
