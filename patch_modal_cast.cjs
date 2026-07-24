const fs = require('fs');
let code = fs.readFileSync('src/components/MovieModal.tsx', 'utf-8');

const replacement = `                  <div className="space-y-3">
                    <h3 className="text-sm font-mono uppercase tracking-widest text-[#f4ecd8] font-bold">
                      Main Cast
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {displayMovie.castDetails && displayMovie.castDetails.length > 0 ? displayMovie.castDetails.map((actor, idx) => (
                        <div key={idx} className="bg-neutral-900/60 border border-zinc-800/40 rounded-lg overflow-hidden text-center hover:bg-neutral-900 transition-colors duration-200">
                          <div className="aspect-[2/3] bg-zinc-800 w-full relative">
                            {actor.imageUrl ? (
                              <img src={actor.imageUrl} referrerPolicy="no-referrer" alt={actor.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                <User className="w-8 h-8" />
                              </div>
                            )}
                          </div>
                          <div className="p-2">
                            <p className="text-xs text-white font-medium truncate">{actor.name}</p>
                            <p className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">{actor.role || 'Role'}</p>
                          </div>
                        </div>
                      )) : displayMovie.cast.map((actor, idx) => (
                        <div key={idx} className="bg-neutral-900/60 border border-zinc-800/40 rounded-lg p-3 text-center hover:bg-neutral-900 transition-colors duration-200">
                          <User className="w-4 h-4 text-zinc-500 mx-auto mb-1.5" />
                          <p className="text-xs text-white font-medium truncate">{actor}</p>
                          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Key Role</p>
                        </div>
                      ))}
                    </div>
                  </div>`;

code = code.replace(
  /<div className="space-y-3">\s*<h3 className="text-sm font-mono uppercase tracking-widest text-\[#f4ecd8\] font-bold">\s*Main Cast\s*<\/h3>\s*<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">\s*\{displayMovie\.cast\.map\(\(actor, idx\) => \(\s*<div key=\{idx\} className="bg-neutral-900\/60 border border-zinc-800\/40 rounded-lg p-3 text-center hover:bg-neutral-900 transition-colors duration-200">\s*<User className="w-4 h-4 text-zinc-500 mx-auto mb-1\.5" \/>\s*<p className="text-xs text-white font-medium truncate">\{actor\}<\/p>\s*<p className="text-\[10px\] text-zinc-500 font-mono mt-0\.5">Key Role<\/p>\s*<\/div>\s*\)\)\}\s*<\/div>\s*<\/div>/,
  replacement
);

fs.writeFileSync('src/components/MovieModal.tsx', code, 'utf-8');
console.log("Patched Cast UI in MovieModal.tsx");
