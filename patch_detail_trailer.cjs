const fs = require('fs');
let code = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf-8');

// Add showTrailer state
code = code.replace(
  /const \[expandedSection, setExpandedSection\] = useState<"synopsis" | "casting" | "trailer" | null>\("synopsis"\);/,
  `const [expandedSection, setExpandedSection] = useState<"casting" | null>(null);
  const [showTrailerModal, setShowTrailerModal] = useState(false);`
);

// Update trailer button click
code = code.replace(
  /<button className="inline-flex items-center gap-2\.5 bg-zinc-800\/80 hover:bg-zinc-700\/80 text-white px-6 py-3 sm:px-8 sm:py-3\.5 rounded-full text-\[13px\] tracking-widest uppercase transition-all duration-200 active:scale-95 cursor-pointer font-bold border border-zinc-700\/50 hover:border-zinc-500\/50">/,
  `<button onClick={() => setShowTrailerModal(true)} className="inline-flex items-center gap-2.5 bg-zinc-800/80 hover:bg-zinc-700/80 text-white px-6 py-3 sm:px-8 sm:py-3.5 rounded-full text-[13px] tracking-widest uppercase transition-all duration-200 active:scale-95 cursor-pointer font-bold border border-zinc-700/50 hover:border-zinc-500/50">`
);

// Add Trailer Modal at the end of the file
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
            {movie.iframeSrc ? (
              <iframe
                src={movie.iframeSrc}
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
`;

code = code.replace(/<\/div>\s*<\/div>\s*\);\s*\}/, `<\/div>\n${trailerModalCode}\n    </div>\n  );\n}`);

fs.writeFileSync('src/components/MovieDetailView.tsx', code, 'utf-8');
console.log("Patched trailer logic!");
