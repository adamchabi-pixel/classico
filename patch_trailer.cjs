const fs = require('fs');
let code = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf-8');

// The Play button section:
// <button
//   onClick={() => { ... }}
//   className="... gold-button ..."
// >
//   <Play className="w-4 h-4 fill-current" />
//   {movie.isTv ? ...}
// </button>
// <button onClick={() => console.log('Added to list')} className="...">
//   <Plus className="..." />
// </button>

const playBtnRegex = /(<button\s*onClick=\{\(\) => console\.log\('Added to list'\)\}.*?>[\s\S]*?<\/button>)/;
const trailerBtn = `
                <button onClick={() => setShowTrailerModal(true)} className="inline-flex items-center gap-2.5 bg-zinc-800/80 hover:bg-zinc-700/80 text-white px-6 py-3 sm:px-8 sm:py-3.5 [@media(max-height:500px)_and_(orientation:landscape)]:px-4 [@media(max-height:500px)_and_(orientation:landscape)]:py-2 rounded-full text-[13px] [@media(max-height:500px)_and_(orientation:landscape)]:text-[11px] tracking-widest uppercase transition-all duration-200 active:scale-95 cursor-pointer font-bold border border-zinc-700/50 hover:border-zinc-500/50">
                  <Film className="w-4 h-4" />
                  TRAILER
                </button>
                $1`;

code = code.replace(playBtnRegex, trailerBtn);

// Also add trailer modal at the end.
const endRegex = /(<\/div>\s*<\/div>\s*\);\s*\})/;
const trailerModalCode = `
      {/* TRAILER MODAL */}
      {showTrailerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-5xl aspect-video bg-zinc-900 rounded-2xl overflow-hidden relative border border-zinc-800 shadow-2xl">
            <button 
              onClick={() => setShowTrailerModal(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors border border-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            {fullMovie.trailerUrl || fullMovie.iframeSrc ? (
              <iframe
                src={fullMovie.trailerUrl || fullMovie.iframeSrc}
                title="Trailer"
                allowFullScreen
                className="w-full h-full"
                style={{ border: 'none' }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500">
                <Film className="w-16 h-16 mb-4 opacity-50" />
                <p>No trailer available</p>
              </div>
            )}
          </div>
        </div>
      )}
      $1`;

code = code.replace(endRegex, trailerModalCode);

fs.writeFileSync('src/components/MovieDetailView.tsx', code, 'utf-8');
console.log("Patched trailer button and modal!");
