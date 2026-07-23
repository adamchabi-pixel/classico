const fs = require('fs');
let code = fs.readFileSync('src/components/MovieModal.tsx', 'utf-8');

const regex = /<motion\.h2[\s\S]*?<p className="text-amber-400 font-mono text-sm tracking-widest drop-shadow-md">\s*\{movie\.director \? movie\.director : "Unknown Director"\} &bull; \{movie\.year\}\s*<\/p>/;

const newCode = `{movie.hasLogo && movie.logoUrl ? (
                  <motion.img
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    src={movie.logoUrl}
                    alt={movie.title}
                    className="max-w-[200px] sm:max-w-[300px] max-h-[100px] object-contain drop-shadow-2xl"
                  />
                ) : (
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl sm:text-5xl font-cinzel font-bold text-white tracking-widest uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                  >
                    {movie.title}
                  </motion.h2>
                )}
                {movie.tagline && (
                  <p className="text-white font-sans text-sm md:text-base leading-relaxed max-w-xl font-light opacity-95 mt-1 mb-2">
                    {movie.tagline}
                  </p>
                )}
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-mono tracking-widest text-zinc-300 pt-1 uppercase">
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
                </p>`;

code = code.replace(regex, newCode);
fs.writeFileSync('src/components/MovieModal.tsx', code, 'utf-8');
console.log("Patched MovieModal hero.");
