const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

const target = `    const fetchMovies = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        let params = new URLSearchParams();
        if (type) params.append('type', type);
        if (page) params.append('page', String(page));
        if (activePlatform !== null) params.append('activePlatform', String(activePlatform));
        if (activeGenre !== null) params.append('activeGenre', String(activeGenre));
        if (activeLanguage !== null) params.append('activeLanguage', String(activeLanguage));
        if (activeYear !== null) params.append('activeYear', String(activeYear));
        
        const res = await fetch(\`/api/discover?\${params.toString()}\`);
        
        const contentType = res.headers.get("content-type");
        if (res.ok && contentType && !contentType.includes("application/json")) {
            throw new Error("L'API backend n'est pas disponible. Si vous êtes en production, assurez-vous que l'application est déployée avec le serveur Node.js (Full-stack) et non comme un simple site statique. Le serveur a retourné du HTML au lieu de JSON.");
        }

        if (res.ok) {
           let json;
           try {
               json = await res.json();
           } catch (parseError) {
               throw new Error("Le serveur a retourné une réponse invalide (peut-être en cours de redémarrage). Veuillez rafraîchir la page.");
           }
           const data = json.data;
           if (data && data.results) {
               const mapped = data.results.filter((r: any) => !r.adult).map((r: any) => {`;

const replacement = `    const fetchMovies = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        let url = \`https://api.themoviedb.org/3/trending/\${type || 'movie'}/day?language=en-US&page=\${page || 1}\`;
        if (type === "tv") url += "&without_genres=16";
        
        if (activePlatform || activeGenre || activeLanguage || activeYear) {
           url = \`https://api.themoviedb.org/3/discover/\${type || 'movie'}?language=en-US&page=\${page || 1}&watch_region=US\`;
           
           if (activeGenre === 'top_rated') {
               url += \`&sort_by=vote_average.desc&vote_count.gte=300\`;
           } else {
               url += \`&sort_by=popularity.desc\`;
           }
           
           if (activePlatform) url += \`&with_watch_providers=\${activePlatform}\`;
           if (activeGenre && activeGenre !== 'top_rated') url += \`&with_genres=\${activeGenre}\`;
           if (activeLanguage) url += \`&with_original_language=\${activeLanguage}\`;
           if (type === "tv") url += \`&without_genres=16\`;
           if (activeYear) {
               const dateField = type === "tv" ? "first_air_date" : "primary_release_date";
               if (activeYear === '2010') {
                   url += \`&\${dateField}.gte=2010-01-01&\${dateField}.lte=2019-12-31\`;
               } else if (activeYear === '2000') {
                   url += \`&\${dateField}.gte=2000-01-01&\${dateField}.lte=2009-12-31\`;
               } else {
                   url += \`&\${dateField}.gte=\${activeYear}-01-01&\${dateField}.lte=\${activeYear}-12-31\`;
               }
           }
        }
        
        const TMDB_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs";
        const res = await fetch(url, {
          headers: { "Authorization": \`Bearer \${TMDB_ACCESS_TOKEN}\`, "Accept": "application/json" }
        });
        
        if (res.ok) {
           let data;
           try {
               data = await res.json();
           } catch (parseError) {
               throw new Error("Le serveur a retourné une réponse invalide (peut-être en cours de rafraichissement).");
           }
           
           const isAnimeOrAdult = (m: any) => {
             if (m.adult) return true;
             if (m.original_language === 'ja' || m.original_language === 'ko' || m.original_language === 'zh') return true;
             if (m.origin_country && (m.origin_country.includes('JP') || m.origin_country.includes('KR') || m.origin_country.includes('CN'))) return true;
             const title = (m.title || m.name || m.original_title || m.original_name || '').toLowerCase();
             if (title.includes('naruto') || title.includes('boruto') || title.includes('dragon ball') || title.includes('one piece') || title.includes('bleach') || title.includes('attack on titan')) return true;
             if (m.genre_ids && m.genre_ids.includes(16)) {
               if (m.origin_country && m.origin_country.includes('JP')) return true;
               if (m.original_language === 'ja') return true;
             }
             return false;
           };

           if (data && data.results) {
               const mapped = data.results.filter((r: any) => !isAnimeOrAdult(r)).map((r: any) => {`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/components/LibraryView.tsx', content);
    console.log("Success");
} else {
    console.log("Target not found");
}
