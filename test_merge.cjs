const { allMoviesData } = require('./src/data/all_movies.ts');
const { importedMoviesData } = require('./src/data/imported_movies.ts');

function cleanTitle(t) {
  return t ? t.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
}

const tmdbMap = new Map();
const finalMap = new Map();

importedMoviesData.forEach(m => {
  const tmdbId = m.tmdbId || m.id;
  tmdbMap.set(String(tmdbId), m);
  finalMap.set(m.id, m);
});

allMoviesData.forEach(m => {
  const tmdbId = m.providerIds?.Tmdb ? String(m.providerIds.Tmdb) : null;
  let matchedImport = null;
  
  if (tmdbId && tmdbMap.has(tmdbId)) {
    matchedImport = tmdbMap.get(tmdbId);
  } else {
    const t1 = cleanTitle(m.title);
    if (t1) {
      for (const [id, imp] of tmdbMap.entries()) {
        if (cleanTitle(imp.title) === t1) {
          matchedImport = imp;
          break;
        }
      }
    }
  }

  if (matchedImport) {
    finalMap.delete(matchedImport.id);
    
    finalMap.set(m.id, {
      ...matchedImport,
      ...m,
      hasLogo: m.hasLogo || matchedImport.hasLogo,
      logoUrl: m.logoUrl || matchedImport.logoUrl,
      castDetails: (m.castDetails && m.castDetails.length > 0) ? m.castDetails : matchedImport.castDetails,
      similar: (m.similar && m.similar.length > 0) ? m.similar : matchedImport.similar,
      director: m.director || matchedImport.director,
      tagline: m.tagline || matchedImport.tagline,
      rating: (m.rating && m.rating !== "N/A") ? m.rating : matchedImport.rating,
      description: m.description || matchedImport.description
    });
  } else {
    finalMap.set(m.id, m);
  }
});

const allMoviesBase = Array.from(finalMap.values());
const se7ens = allMoviesBase.filter(m => m.title === 'Se7en');
console.log('Found Se7ens:', se7ens.length);
se7ens.forEach(s => console.log(s.id, s.castDetails?.length, s.providerIds));
