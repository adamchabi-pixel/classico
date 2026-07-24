const tsNode = require('ts-node').register({ transpileOnly: true });
const { importedMoviesData } = require('./src/data/imported_movies.ts');

const shadows = importedMoviesData.find(m => m.id === "3f786303c08f1b396d482558b930a45c");
console.log("Shadows in Paradise TMDB ID:", shadows?.tmdbId);

const superbad = importedMoviesData.find(m => m.id === "8363" || m.tmdbId === "8363" || String(m.id).includes("8363"));
console.log("Superbad:", superbad?.id, superbad?.title);

