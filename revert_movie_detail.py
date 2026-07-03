import re

with open("src/components/MovieDetailView.tsx", "r") as f:
    content = f.read()

# Remove the casting carousel block completely
carousel_regex = re.compile(r'\s*\{\/\* CASTING CAROUSEL.*?\{\/\* 3\. MINIMALIST COLLAPSIBLE ACCORDION PANELS \*\/\}', re.DOTALL)
if carousel_regex.search(content):
    content = carousel_regex.sub('\n      {/* 3. MINIMALIST COLLAPSIBLE ACCORDION PANELS */}', content)

# Inject the Section B back into the accordion
section_b = """          {/* SECTION B: CASTING */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleSection("casting")}
              className="flex items-center justify-between p-5 text-left w-full hover:bg-neutral-900/40 transition-colors cursor-pointer group"
            >
              <span className="flex items-center gap-3 font-forum text-base sm:text-lg font-bold uppercase tracking-wider text-[#D4AF37] group-hover:text-[#e8ce7a] transition-colors duration-250">
                <Users className="w-5 h-5 text-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.3)]" />
                Distribution
              </span>
              <ChevronDown
                className={`w-5 h-5 text-zinc-500 group-hover:text-[#D4AF37] transition-transform duration-300 ${
                  expandedSection === "casting" ? "transform rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {expandedSection === "casting" && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-6 pt-0 space-y-4">
                    <p className="text-xs font-mono uppercase tracking-wider text-[#D4AF37]">Acteurs principaux :</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {movie.cast.map((actor, idx) => (
                        <div
                          key={`${actor}-${idx}`}
                          className="flex items-center gap-3 bg-neutral-900/60 border border-[#D4AF37]/20 p-3.5 rounded-xl text-zinc-300 text-sm font-sans"
                        >
                          <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-xs font-mono font-bold text-[#D4AF37] border border-[#D4AF37]/30 shadow-sm">
                            {actor.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <span className="font-medium tracking-wide text-zinc-200">{actor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
"""

target_insert = "{/* SECTION C: BANDE ANNONCE */}"
if target_insert in content:
    content = content.replace(target_insert, section_b + "\n          " + target_insert)

with open("src/components/MovieDetailView.tsx", "w") as f:
    f.write(content)
