import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

old_map = r'''              originalTitle: match.originalTitle \|\| movie.originalTitle,
              studios: match.studios \|\| movie.studios,
              director: match.director \|\| movie.director,
              genre: match.genre \|\| movie.genre
            \} as Movie;'''

new_map = '''              originalTitle: match.originalTitle || movie.originalTitle,
              studios: match.studios || movie.studios,
              director: movie.director || match.director,
              genre: (movie.genre && movie.genre.length > 0) ? movie.genre : match.genre,
              description: movie.description || match.description,
              cast: (movie.cast && movie.cast.length > 0) ? movie.cast : match.cast,
              tagline: movie.tagline || match.tagline,
              rating: movie.rating && movie.rating !== "N/A" ? movie.rating : match.rating
            } as Movie;'''

text = re.sub(old_map, new_map, text)

# Also ensure isJellyfin is true for all unmatched movies
old_unmatched = r'''    jellyfinMovies.forEach(m => {
      if (!map.has(m.id)) {
        map.set(m.id, m);
      }
    });'''

new_unmatched = '''    jellyfinMovies.forEach(m => {
      if (!map.has(m.id)) {
        map.set(m.id, { ...m, isJellyfin: true });
      }
    });'''

text = text.replace(old_unmatched, new_unmatched)

with open('src/App.tsx', 'w') as f:
    f.write(text)
