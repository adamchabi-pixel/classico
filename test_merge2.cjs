const { allMoviesData } = require('./src/data/all_movies.ts');
const { importedMoviesData } = require('./src/data/imported_movies.ts');

const combined = [...importedMoviesData, ...allMoviesData];
const groups = new Map();

const cleanTitle = (t) => t ? t.toLowerCase().replace(/[^a-z0-9]/g, '') : '';

combined.forEach(m => {
  let key = null;
  if (m.tmdbId) key = `tmdb_${m.tmdbId}`;
  else if (m.providerIds && m.providerIds.Tmdb) key = `tmdb_${m.providerIds.Tmdb}`;
  else if (m.id && /^\d+$/.test(m.id)) key = `tmdb_${m.id}`;
  else key = `title_${cleanTitle(m.title)}`;
  
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(m);
});

const finalMovies = [];

groups.forEach(group => {
  let baseMovie = group.find(m => m.isJellyfin || m.streamUrl) || group[0];
  let merged = { ...baseMovie };
  
  group.forEach(m => {
    if (m === baseMovie) return;
    merged = {
      ...m,
      ...merged,
      hasLogo: merged.hasLogo || m.hasLogo,
      logoUrl: merged.logoUrl || m.logoUrl,
      castDetails: (merged.castDetails && merged.castDetails.length > 0) ? merged.castDetails : m.castDetails,
      similar: (merged.similar && merged.similar.length > 0) ? merged.similar : m.similar,
      director: merged.director || m.director,
      tagline: merged.tagline || m.tagline,
      rating: (merged.rating && merged.rating !== "N/A") ? merged.rating : m.rating,
      description: merged.description || m.description,
      seasons: (merged.seasons && merged.seasons.length > 0) ? merged.seasons : m.seasons,
      voteAverage: merged.voteAverage || m.voteAverage,
      backdropUrl: merged.backdropUrl || m.backdropUrl,
      posterUrl: merged.posterUrl || m.posterUrl
    };
  });
  
  finalMovies.push(merged);
});

const se7ens = finalMovies.filter(m => m.title === 'Se7en');
console.log('Found Se7ens:', se7ens.length);
se7ens.forEach(s => console.log('ID:', s.id, 'Cast:', s.castDetails?.length, 'isJellyfin:', s.isJellyfin));

const indys = finalMovies.filter(m => m.title.includes('Indiana Jones'));
console.log('Indiana Jones:', indys.length);
indys.forEach(s => console.log('Title:', s.title, 'Cast:', s.castDetails?.length));
