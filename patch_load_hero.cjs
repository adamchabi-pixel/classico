const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldLoad = `  const loadJellyfinLibrary = async () => {
    try {
      const res = await fetch("/api/jellyfin/movies");
      const data = await res.json();
      if (data.success) {
        setJellyfinMovies(data.movies);
      }
    } catch (e) {}
  };`;

const newLoad = `  const loadJellyfinLibrary = async () => {
    try {
      const res = await fetch("/api/jellyfin/movies");
      const data = await res.json();
      if (data.success) {
        setJellyfinMovies(data.movies);
        const heroImports = data.movies.filter((m: any) => m.isHero);
        if (heroImports.length > 0) {
          const combinedHeroes = [...heroImports, ...heroMoviesData.heroes];
          const uniqueHeroes = Array.from(new Map(combinedHeroes.map(m => [m.id, m])).values());
          setJellyfinHeroMovies(uniqueHeroes);
        }
      }
    } catch (e) {}
  };`;

code = code.replace(oldLoad, newLoad);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched loadJellyfinLibrary");
