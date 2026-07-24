const fs = require('fs');
let code = fs.readFileSync('src/components/MovieModal.tsx', 'utf-8');

const similarBlock = `
              </div>
              
              {/* Similar Content */}
              {displayMovie.similar && displayMovie.similar.length > 0 && (
                <div className="mt-8 space-y-4">
                  <h3 className="text-sm font-mono uppercase tracking-widest text-[#f4ecd8] font-bold pb-2 border-b border-zinc-800/50">
                    Similar Content
                  </h3>
                  <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-4 no-scrollbar scroll-smooth">
                    {displayMovie.similar.map((sim, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          onClose();
                          window.location.href = "/movie/" + sim.id;
                        }}
                        className="shrink-0 w-28 sm:w-32 group cursor-pointer text-left"
                      >
                        <div className="aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 relative border border-zinc-800/50 group-hover:border-zinc-500/50 transition-colors">
                          {sim.posterUrl ? (
                            <img src={sim.posterUrl} referrerPolicy="no-referrer" alt={sim.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-zinc-900">
                              <Film className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        <p className="mt-2 text-xs sm:text-sm font-bold text-white group-hover:text-[#f4ecd8] transition-colors truncate">
                          {sim.title}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
        </motion.div>`;

code = code.replace(
  /<\/div>\s*<\/motion\.div>/,
  similarBlock
);

fs.writeFileSync('src/components/MovieModal.tsx', code, 'utf-8');
console.log("Patched Similar Content in MovieModal.tsx");
