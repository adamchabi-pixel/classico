const fs = require('fs');

let code = fs.readFileSync('src/components/MovieModal.tsx', 'utf-8');

// I will just replace from line 96 to 101 with a simple hero section.
// Looking at what's missing, it's the backdrop image, the play button, and the title.

const newHero = `          {/* Top Back Button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 z-20 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full border border-white/20 backdrop-blur-md transition-all active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {/* Top Hero Section */}
          <div className="relative w-full h-64 sm:h-96 md:h-[400px]">
            <img
              src={movie.backdropUrl || movie.posterUrl}
              alt={movie.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
            
            {/* Title & Play Button Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3">
                <motion.h2 
                  layoutId={\`title-\${movie.id}\`}
                  className="text-4xl sm:text-5xl font-cinzel font-bold text-white tracking-widest uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                >
                  {movie.title}
                </motion.h2>
                <p className="text-amber-400 font-mono text-sm tracking-widest drop-shadow-md">
                  {movie.director} &bull; {movie.year}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onPlay(movie.id)}
                  className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-3 rounded-xl font-bold font-display uppercase tracking-widest flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                >
                  <Play className="w-5 h-5 fill-current" />
                  {checkingJellyfin ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin opacity-70" />
                      Loading
                    </>
                  ) : (
                    "Play Now"
                  )}
                </button>
              </div>
            </div>
          </div>`;

// Replace lines 96-101.
// We can use a regex or string replacement.
const badSection = `<motion.div
          layoutId={\`card-container-\${movie.id}\`}
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={\`relative w-full max-w-4xl bg-stone-950 rounded-2xl overflow-hidden shadow-2xl border border-neutral-800/80 max-h-[92vh] flex flex-col z-10\`}
        >
          {/* Top Back Button */}
              
                  </div>
                </div>
              </div>

              {/* Movie Details Block */}`;

const replaceWith = `<motion.div
          layoutId={\`card-container-\${movie.id}\`}
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={\`relative w-full max-w-4xl bg-stone-950 rounded-2xl overflow-hidden shadow-2xl border border-neutral-800/80 max-h-[92vh] flex flex-col z-10 overflow-y-auto\`}
        >
${newHero}
              {/* Movie Details Block */}`;

code = code.replace(badSection, replaceWith);
fs.writeFileSync('src/components/MovieModal.tsx', code, 'utf-8');
console.log("Restored MovieModal.tsx hero section");
