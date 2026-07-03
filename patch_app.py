import re

with open("src/App.tsx", "r") as f:
    content = f.read()

state_target = "const [searchQuery, setSearchQuery] = useState(\"\");"
state_replacement = """const [searchQuery, setSearchQuery] = useState("");
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  useEffect(() => {
    const data = localStorage.getItem("classico_progress");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        const arr = Object.values(parsed).sort((a: any, b: any) => (b.updatedAt || 0) - (a.updatedAt || 0));
        setRecentlyViewed(arr);
      } catch(e) {}
    }
  }, [currentPath]);"""

if state_target in content:
    content = content.replace(state_target, state_replacement)
    print("Added recentlyViewed state")

# Add the row to render
hero_target = """        {/* MAIN CINEMATIC HERO */}
        <div className="relative z-10 -mt-16 w-full max-w-[2000px] mx-auto 2xl:rounded-b-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">"""

hero_render_target = """          </AnimatePresence>
        </div>"""
# Wait, let's insert it after the HERO, before COLLECTIONS.
# Let's find where COLLECTIONS is mapped.
collections_target = """        <div className="relative z-20 -mt-32 pb-32 space-y-12 sm:space-y-16">
          {filteredCollections.length > 0 ? (
            filteredCollections.map((collection, index) => {"""

collections_replacement = """        <div className="relative z-20 -mt-32 pb-32 space-y-12 sm:space-y-16">
          
          {/* RECENTLY VIEWED SECTION */}
          {recentlyViewed.length > 0 && !searchQuery && (
            <div className="w-full relative px-4 sm:px-8 md:px-12 pt-8">
              <div className="flex items-center gap-3 mb-6">
                <History className="w-6 h-6 text-amber-500" />
                <h2 className="text-xl sm:text-2xl font-bold font-sans text-white tracking-tight">
                  Recently Viewed
                </h2>
              </div>
              <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-6 pt-2 px-2 -mx-2 hide-scrollbar snap-x snap-mandatory">
                {recentlyViewed.map((movie) => {
                  const progressPercent = movie.duration ? (movie.currentTime / movie.duration) * 100 : 0;
                  return (
                    <motion.div
                      key={movie.id}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigateTo("/movie/" + movie.id)}
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
                          <div className="w-12 h-12 rounded-full bg-amber-500/90 text-zinc-950 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-all duration-300">
                            <Play className="w-5 h-5 ml-1" />
                          </div>
                        </div>
                      </div>
                      
                      {/* PROGRESS BAR */}
                      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-900 overflow-hidden">
                        <div 
                          className="h-full bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.6)]" 
                          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {filteredCollections.length > 0 ? (
            filteredCollections.map((collection, index) => {"""

if collections_target in content:
    content = content.replace(collections_target, collections_replacement)
    print("Added recently viewed render")
else:
    print("Collections target not found")

with open("src/App.tsx", "w") as f:
    f.write(content)
