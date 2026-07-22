const fs = require('fs');
let code = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf-8');

// Add state imports if not present
if (!code.includes('useState')) {
  code = code.replace(/import React from "react";/, 'import React, { useState } from "react";');
} else {
  // already imported
}

code = code.replace(/export default function MovieDetailView\(\{\s*movie,\s*onBack,\s*onPlay,?\s*\}\s*:\s*MovieDetailViewProps\)\s*\{/, `export default function MovieDetailView({
  movie,
  onBack,
  onPlay,
}: MovieDetailViewProps) {
  const [selectedSeason, setSelectedSeason] = React.useState(movie.seasons && movie.seasons.length > 0 ? movie.seasons[0].season_number : 1);
  
  const handlePlayEpisode = (seasonNum: number, episodeNum: number) => {
    onPlay(movie.id + "-S" + seasonNum + "E" + episodeNum);
  };`);

// Replace the CTA button area with conditional rendering for TV shows
const ctaRegex = /\{\/\* Main Interactive CTA Button Area \*\/\}\s*<div className="flex items-center gap-3\.5 pt-3 \[@media\(max-height:500px\)_and_\(orientation:landscape\)\]:pt-1">\s*<button\s*onClick=\{[^}]*\}\s*className="inline-flex[^"]*"\s*>\s*<Play className="w-4 h-4 fill-current" \/>\s*Play\s*<\/button>\s*<\/div>/m;

const tvHtml = `{/* Main Interactive CTA Button Area */}
            {movie.isTv ? (
              <div className="flex flex-col gap-4 pt-4 w-full">
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                  {movie.seasons?.find((s: any) => s.season_number === selectedSeason) &&
                    Array.from({ length: movie.seasons.find((s: any) => s.season_number === selectedSeason).episode_count }).map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePlayEpisode(selectedSeason, i + 1)}
                        className="group flex items-center justify-between bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 rounded-lg p-3 transition-colors text-left"
                      >
                        <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">Ep. {i + 1}</span>
                        <Play className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition-colors" />
                      </button>
                    ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3.5 pt-3 [@media(max-height:500px)_and_(orientation:landscape)]:pt-1">
                <button
                  onClick={() => onPlay(movie.id)}
                  className="inline-flex items-center gap-2.5 gold-button px-6 py-3 sm:px-8 sm:py-3.5 [@media(max-height:500px)_and_(orientation:landscape)]:px-4 [@media(max-height:500px)_and_(orientation:landscape)]:py-2 rounded-full text-[13px] [@media(max-height:500px)_and_(orientation:landscape)]:text-[11px] tracking-widest uppercase transition-all duration-200 active:scale-95 cursor-pointer font-bold"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Play
                </button>
              </div>
            )}`;

code = code.replace(ctaRegex, tvHtml);

fs.writeFileSync('src/components/MovieDetailView.tsx', code, 'utf-8');
console.log("Patched MovieDetailView.");
