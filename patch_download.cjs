const fs = require('fs');
let file = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf8');

const target1 = `  const getDownloadUrl = () => {
    const tmdbId = fullMovie.providerIds?.Tmdb || fullMovie.tmdbId || fullMovie.id;
    const cleanId = String(tmdbId).replace('-tv', '');
    if (fullMovie.isTv) {
       const s = lastWatched ? lastWatched.season : (selectedSeason || 1);
       const e = lastWatched ? lastWatched.episode : 1;
       return \`https://mediatv.trendingpie.com/?id=\${cleanId}&s=\${s}&e=\${e}\`;
    }
    return \`https://mediatv.trendingpie.com/?id=\${cleanId}\`;
  };

  const getEpisodeDownloadUrl = (s: number, e: number) => {
    const tmdbId = fullMovie.providerIds?.Tmdb || fullMovie.tmdbId || fullMovie.id;
    const cleanId = String(tmdbId).replace('-tv', '');
    return \`https://mediatv.trendingpie.com/?id=\${cleanId}&s=\${s}&e=\${e}\`;
  };`;

const replace1 = `  const getDownloadUrl = () => {
    const tmdbId = fullMovie.providerIds?.Tmdb || fullMovie.tmdbId;
    if (!tmdbId) return "#";
    const cleanId = String(tmdbId).replace('-tv', '');
    if (fullMovie.isTv) {
       const s = lastWatched ? lastWatched.season : (selectedSeason || 1);
       const e = lastWatched ? lastWatched.episode : 1;
       return \`https://mediatv.trendingpie.com/?id=\${cleanId}&s=\${s}&e=\${e}\`;
    }
    return \`https://mediatv.trendingpie.com/?id=\${cleanId}\`;
  };

  const getEpisodeDownloadUrl = (s: number, e: number) => {
    const tmdbId = fullMovie.providerIds?.Tmdb || fullMovie.tmdbId;
    if (!tmdbId) return "#";
    const cleanId = String(tmdbId).replace('-tv', '');
    return \`https://mediatv.trendingpie.com/?id=\${cleanId}&s=\${s}&e=\${e}\`;
  };`;

file = file.replace(target1, replace1);

const target2 = `<a href={getDownloadUrl()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-zinc-800/80 hover:bg-zinc-700/80 text-white rounded-full transition-all active:scale-95 cursor-pointer border border-zinc-700/50 hover:border-zinc-500/50 shrink-0" title="Télécharger">`;

const replace2 = `<a href={getDownloadUrl()} target={getDownloadUrl() === "#" ? "_self" : "_blank"} rel="noopener noreferrer" onClick={(e) => { if (getDownloadUrl() === "#") { e.preventDefault(); alert("Lien de téléchargement non disponible pour ce titre."); } }} className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-zinc-800/80 hover:bg-zinc-700/80 text-white rounded-full transition-all active:scale-95 cursor-pointer border border-zinc-700/50 hover:border-zinc-500/50 shrink-0" title="Télécharger">`;

file = file.replace(target2, replace2);

const target3 = `                        href={getEpisodeDownloadUrl(selectedSeason, ep.episode_number)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        title="Télécharger"
                        className="p-2 sm:p-2.5 rounded-full bg-zinc-800/50 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all border border-zinc-700/50 shrink-0"
                      >
                        <Download className="w-4 h-4" />
                      </a>`;

const replace3 = `                        href={getEpisodeDownloadUrl(selectedSeason, ep.episode_number)} 
                        target={getEpisodeDownloadUrl(selectedSeason, ep.episode_number) === "#" ? "_self" : "_blank"} 
                        rel="noopener noreferrer"
                        onClick={(e) => { if (getEpisodeDownloadUrl(selectedSeason, ep.episode_number) === "#") { e.preventDefault(); alert("Lien de téléchargement non disponible."); } }}
                        title="Télécharger"
                        className="p-2 sm:p-2.5 rounded-full bg-zinc-800/50 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all border border-zinc-700/50 shrink-0"
                      >
                        <Download className="w-4 h-4" />
                      </a>`;

file = file.replace(target3, replace3);

fs.writeFileSync('src/components/MovieDetailView.tsx', file);
