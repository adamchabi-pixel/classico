const fs = require('fs');
let code = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf-8');

// 1. Remove the old isTv conditional rendering for the play buttons and episodes list inside the hero
const heroBlockRegex = /\{movie\.isTv \? \([\s\S]*?<div className="flex flex-col gap-4 pt-4 w-full">[\s\S]*?<\/div>\s*\) : \([\s\S]*?<\/div>\s*\)\}/m;

const newHeroBlock = `<div className="flex items-center gap-3.5 pt-3 [@media(max-height:500px)_and_(orientation:landscape)]:pt-1">
                <button
                  onClick={() => {
                    if (movie.isTv) {
                      const s = lastWatched ? lastWatched.season : (selectedSeason || 1);
                      const e = lastWatched ? lastWatched.episode : 1;
                      handlePlayEpisode(s, e);
                    } else {
                      onPlay(movie.id);
                    }
                  }}
                  className="inline-flex items-center gap-2.5 gold-button px-6 py-3 sm:px-8 sm:py-3.5 [@media(max-height:500px)_and_(orientation:landscape)]:px-4 [@media(max-height:500px)_and_(orientation:landscape)]:py-2 rounded-full text-[13px] [@media(max-height:500px)_and_(orientation:landscape)]:text-[11px] tracking-widest uppercase transition-all duration-200 active:scale-95 cursor-pointer font-bold"
                >
                  <Play className="w-4 h-4 fill-current" />
                  {movie.isTv ? (lastWatched ? \`PLAY S\${String(lastWatched.season).padStart(2, '0')}E\${String(lastWatched.episode).padStart(2, '0')}\` : \`PLAY S\${String(selectedSeason || 1).padStart(2, '0')}E01\`) : 'Play'}
                </button>
                <button onClick={() => console.log('Added to list')} className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-neutral-800/80 hover:bg-neutral-700/80 text-white rounded-full transition-all active:scale-95 cursor-pointer border border-neutral-700/50 hover:border-neutral-500/50 shrink-0">
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>`;

code = code.replace(heroBlockRegex, newHeroBlock);

// 2. Insert the episodes list after the hero (before accordion)
const accordionStartRegex = /\{\/\* 3\. MINIMALIST COLLAPSIBLE ACCORDION PANELS \*\/\}/;

const newEpisodesSection = `{movie.isTv && (
        <div className="max-w-4xl mx-auto px-4 sm:px-8 mt-8 space-y-6 text-left">
          <div className="flex gap-4 border-b border-zinc-800 pb-2 overflow-x-auto no-scrollbar">
            {movie.seasons?.map((s: any) => (
              <button
                key={s.season_number}
                onClick={() => setSelectedSeason(s.season_number)}
                className={\`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all \${selectedSeason === s.season_number ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'text-zinc-400 hover:text-white border border-transparent hover:border-zinc-700'}\`}
              >
                Saison {s.season_number}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            {episodes.length > 0 ? (
              episodes.map((ep, i) => (
                <button
                  key={ep.episode_number}
                  onClick={() => handlePlayEpisode(selectedSeason, ep.episode_number)}
                  className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-zinc-900/30 hover:bg-zinc-800/80 rounded-xl p-3 transition-colors text-left border border-transparent hover:border-zinc-700/50"
                >
                  <div className="relative shrink-0 w-full sm:w-40 aspect-video rounded-lg overflow-hidden bg-zinc-800">
                    {ep.stillUrl ? (
                      <img src={ep.stillUrl} alt={ep.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <Film className="w-6 h-6" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center border border-white/20">
                        <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                      </div>
                    </div>
                    {ep.runtime > 0 && (
                      <div className="absolute bottom-1.5 right-1.5 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-white">
                        {ep.runtime}m
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <h4 className="text-sm font-bold text-zinc-100 group-hover:text-amber-400 transition-colors truncate">
                        {ep.episode_number}. {ep.name}
                      </h4>
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed mt-1">
                      {ep.overview || "Aucun résumé disponible."}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. MINIMALIST COLLAPSIBLE ACCORDION PANELS */}`;

code = code.replace(accordionStartRegex, newEpisodesSection);

fs.writeFileSync('src/components/MovieDetailView.tsx', code, 'utf-8');
console.log("Patched MovieDetailView layout!");
