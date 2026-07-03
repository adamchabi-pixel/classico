import re

with open("src/App.tsx", "r") as f:
    content = f.read()

recently_viewed_ui = """
                {/* RECENTLY VIEWED SECTION */}
                {recentlyViewed.length > 0 && !searchQuery && (
                  <div className="space-y-4 text-left pb-10">
                    <div className="flex flex-row items-center justify-between gap-2 border-b border-zinc-900 pb-2">
                      <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-amber-500" />
                        <h2 className="text-[14px] sm:text-[18px] font-cinzel font-bold text-white uppercase tracking-[0.1em] sm:tracking-[0.2em]">
                          Recently Viewed
                        </h2>
                      </div>
                    </div>
                    <div className="relative group w-full">
                      <div className="flex gap-3 sm:gap-6 overflow-x-auto no-scrollbar py-2.5 px-1 pb-4 snap-x snap-mandatory">
                        {recentlyViewed.map((movie) => {
                          const progressPercent = movie.duration ? (movie.currentTime / movie.duration) * 100 : 0;
                          return (
                            <motion.div
                              key={movie.id}
                              whileHover={{ scale: 1.05, y: -5 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                // Jump directly to playback
                                (window as any).moviePlayClickTime = performance.now();
                                navigateTo("/player/" + movie.id);
                              }}
                              className="relative shrink-0 snap-center cursor-pointer group rounded-xl overflow-hidden shadow-xl"
                              style={{ width: "160px" }}
                            >
                              <div className="aspect-[2/3] w-full relative">
                                <img 
                                  src={movie.poster} 
                                  alt={movie.title}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                  <div className="w-12 h-12 rounded-full bg-amber-500/90 text-zinc-950 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                                    <Play className="w-5 h-5 ml-1" />
                                  </div>
                                </div>
                                <div className="absolute bottom-4 left-2 right-2 text-center z-20">
                                  <h3 className="text-white text-xs font-bold truncate drop-shadow-md">{movie.title}</h3>
                                </div>
                              </div>
                              
                              {/* PROGRESS BAR */}
                              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-900 z-30">
                                <div 
                                  className="h-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" 
                                  style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                                />
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
"""

target = """                <div className="text-left py-1 select-none">
                  <h2 className="font-cinzel font-bold text-[17px] sm:text-2xl tracking-[0.1em] sm:tracking-[0.22em] gold-metallic-text uppercase leading-none whitespace-nowrap">
                    THEMATIC LIBRARY
                  </h2>"""

if target in content:
    content = content.replace(target, recently_viewed_ui + target)
    print("Injected Recently Viewed UI")
else:
    print("Could not find THEMATIC LIBRARY target")

with open("src/App.tsx", "w") as f:
    f.write(content)
