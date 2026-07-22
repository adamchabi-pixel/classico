const fs = require('fs');

let code = fs.readFileSync('src/components/MovieModal.tsx', 'utf-8');
const lines = code.split('\n');

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

// 96 to 101 need to be replaced with newHero
// Actually let's look at lines again
let newLines = [];
let i = 0;
while (i < lines.length) {
  if (lines[i].includes('{/* Top Back Button */}')) {
    newLines.push(newHero);
    // skip until {/* Movie Details Block */}
    while(i < lines.length && !lines[i].includes('{/* Movie Details Block */}')) {
      i++;
    }
    // Now i is at Movie Details Block
    newLines.push(lines[i]);
  } else {
    newLines.push(lines[i]);
  }
  i++;
}

fs.writeFileSync('src/components/MovieModal.tsx', newLines.join('\n'), 'utf-8');
console.log("Restored MovieModal.tsx via lines");
