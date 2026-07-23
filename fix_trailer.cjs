const fs = require('fs');
let code = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf-8');

const trailerModalCode = `
      {showTrailerModal && (
        <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
            <button 
              onClick={() => setShowTrailerModal(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
            {fullMovie.trailerUrl ? (
              <iframe 
                src={fullMovie.trailerUrl.includes('youtube.com/watch?v=') ? fullMovie.trailerUrl.replace('watch?v=', 'embed/') : fullMovie.trailerUrl}
                className="w-full h-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
                <Film className="w-12 h-12 opacity-50" />
                <p className="font-mono text-sm">Trailer not available for this title</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
`;

code = code.replace(
  /    <\/div>\n  \);\n\}\n?$/g,
  trailerModalCode
);

fs.writeFileSync('src/components/MovieDetailView.tsx', code, 'utf-8');
console.log("Trailer modal added");
