const fs = require('fs');
let code = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf-8');

// Title -> Logo
code = code.replace(
  /<h1 className="text-4xl sm:text-5xl md:text-6xl \[@media\(max-height:500px\)_and_\(orientation:landscape\)\]:text-3xl font-forum font-bold tracking-wider text-white uppercase drop-shadow-xl leading-tight">\s*\{movie\.title\}\s*<\/h1>/,
  `{movie.hasLogo && movie.logoUrl ? (
              <img src={movie.logoUrl} alt={movie.title} className="max-w-[200px] sm:max-w-[300px] max-h-[100px] object-contain drop-shadow-2xl" />
            ) : (
              <h1 className="text-4xl sm:text-5xl md:text-6xl [@media(max-height:500px)_and_(orientation:landscape)]:text-3xl font-forum font-bold tracking-wider text-white uppercase drop-shadow-xl leading-tight">
                {movie.title}
              </h1>
            )}`
);

// Tagline
code = code.replace(
  /\{movie\.tagline && \([\s\S]*?<p className="text-zinc-300 font-sans text-sm md:text-base leading-relaxed max-w-xl italic font-light opacity-90">\s*\"\{movie\.tagline\}\"\s*<\/p>\s*\)\}/,
  `{movie.tagline && (
              <p className="text-white font-sans text-sm md:text-base leading-relaxed max-w-xl font-light opacity-95">
                {movie.tagline}
              </p>
            )}`
);

// Sub-info row -> update translations and add seasons/language
const subinfoRegex = /<div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-\[11px\] font-mono tracking-widest text-zinc-300 pt-1 uppercase">[\s\S]*?<\/div>/;
code = code.replace(subinfoRegex, `<div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-mono tracking-widest text-zinc-300 pt-1 uppercase">
              <span className="text-amber-400 font-extrabold flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded shadow-sm">
                <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                {movie.rating || movie.voteAverage}
              </span>
              {movie.isTv && movie.seasons && (
                <>
                  <span>•</span>
                  <span>{movie.seasons.length} Seasons</span>
                </>
              )}
              {movie.originalLanguage && (
                <>
                  <span>•</span>
                  <span>{movie.originalLanguage.toUpperCase()}</span>
                </>
              )}
              <span>•</span>
              <span className="text-zinc-400">{Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre}</span>
            </div>
            
            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed max-w-2xl font-sans font-light line-clamp-3 sm:line-clamp-4 mt-2">
              {movie.description}
            </p>`);

// Translate "Ma Liste" -> "My List" in the button
code = code.replace(
  /<button onClick=\{\(\) => console\.log\('Added to list'\)\}.*?<\/button>/g,
  (match) => {
    if (match.includes("Ma Liste")) {
      return match.replace("Ma Liste", "My List");
    }
    return match;
  }
);

// Seasons selector
const episodesSectionRegex = /<div className="max-w-4xl mx-auto px-4 sm:px-8 mt-8 space-y-6 text-left">[\s\S]*?<div className="flex gap-4 border-b border-zinc-800 pb-2 overflow-x-auto no-scrollbar">[\s\S]*?<\/div>\s*<div className="flex flex-col gap-4">/;

const newEpisodesTop = `<div className="max-w-4xl mx-auto px-4 sm:px-8 mt-8 space-y-6 text-left">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-4 relative z-20">
            <h3 className="text-lg font-bold text-white uppercase tracking-widest">Episodes</h3>
            <div className="relative group">
              <button className="flex items-center gap-2 text-zinc-300 hover:text-white bg-zinc-900/50 hover:bg-zinc-800 px-4 py-2 rounded-lg transition-colors border border-zinc-800 hover:border-zinc-700 font-bold text-sm tracking-widest uppercase cursor-pointer">
                Season {selectedSeason} <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all overflow-hidden z-50">
                <div className="max-h-[300px] overflow-y-auto no-scrollbar py-1">
                  {movie.seasons?.map((s: any) => (
                    <button
                      key={s.season_number}
                      onClick={() => setSelectedSeason(s.season_number)}
                      className={\`w-full text-left px-4 py-3 text-sm font-bold tracking-widest uppercase transition-colors hover:bg-zinc-800 \${selectedSeason === s.season_number ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-300'}\`}
                    >
                      Season {s.season_number}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 relative z-10">`;

code = code.replace(episodesSectionRegex, newEpisodesTop);

fs.writeFileSync('src/components/MovieDetailView.tsx', code, 'utf-8');
console.log("Patched MovieDetailView.tsx");
