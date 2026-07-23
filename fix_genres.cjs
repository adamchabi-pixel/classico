const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetRegex = /const genreGroups: Record<string, Movie\[\]> = {};[\s\S]*?const genreCollections = Object\.entries\(genreGroups\)\.map\(\(\[genreName, movies\]\) => \{[\s\S]*?\}\)\.filter\(\(g\) => g\.movies\.length > 0\);/g;

const replacement = `const genreGroupsMap: Record<string, { title: string, movies: Movie[] }> = {};
    finalUnmatchedMovies.forEach((movie) => {
      const genres = movie.genre && movie.genre.length > 0 ? movie.genre : ["Divers"];
      genres.forEach((genreName) => {
        const title = genreName.trim();
        const idClean = title.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "-");
        
        if (!genreGroupsMap[idClean]) {
          genreGroupsMap[idClean] = { title, movies: [] };
        }
        if (!genreGroupsMap[idClean].movies.some((m) => m.id === movie.id)) {
          genreGroupsMap[idClean].movies.push({
            ...movie,
            gradient: GENRE_AESTHETICS[title.toLowerCase()]?.gradient || "from-slate-900 via-neutral-900 to-zinc-950/40",
            accentColor: GENRE_AESTHETICS[title.toLowerCase()]?.accentColor || "text-zinc-400 border-zinc-800 bg-zinc-900/10",
            accentHex: GENRE_AESTHETICS[title.toLowerCase()]?.accentHex || "#71717a",
            symbol: GENRE_AESTHETICS[title.toLowerCase()]?.symbol || "🎬🎥"
          });
        }
      });
    });

    // Construct dynamic genre collections
    const genreCollections = Object.values(genreGroupsMap).map(({ title, movies }) => {
      const idClean = title.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "-");
      const config = GENRE_AESTHETICS[title.toLowerCase()] || {
        description: \`Selection of auteur films cataloged under the \${title} theme.\`
      };
      return {
        id: \`genre-\${idClean}\`,
        title: \`Cinéma \${title}\`,
        description: config.description,
        movies: movies
      };
    }).filter((g) => g.movies.length > 0);`;

const newCode = code.replace(targetRegex, replacement);
if (newCode === code) {
  console.log("No match found!");
} else {
  fs.writeFileSync('src/App.tsx', newCode, 'utf-8');
  console.log("Fixed genre collections logic to group by idClean");
}
