const fs = require('fs');
let code = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf-8');

// Trailer button
const buttonsRegex = /<button onClick=\{\(\) => console\.log\('Added to list'\)\}.*?<\/button>\s*<\/div>/;
const newButtons = `<button className="inline-flex items-center gap-2.5 bg-zinc-800/80 hover:bg-zinc-700/80 text-white px-6 py-3 sm:px-8 sm:py-3.5 rounded-full text-[13px] tracking-widest uppercase transition-all duration-200 active:scale-95 cursor-pointer font-bold border border-zinc-700/50 hover:border-zinc-500/50">
                  <Film className="w-4 h-4" />
                  TRAILER
                </button>
                <button onClick={() => console.log('Added to list')} className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-neutral-800/80 hover:bg-neutral-700/80 text-white rounded-full transition-all active:scale-95 cursor-pointer border border-neutral-700/50 hover:border-neutral-500/50 shrink-0">
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>`;
code = code.replace(buttonsRegex, newButtons);

// Make the hero content lower
code = code.replace(
  /<div className="relative z-10 max-w-\[2000px\] mx-auto w-full px-4 sm:px-8 pb-4 sm:pb-6 \[@media\(max-height:500px\)_and_\(orientation:landscape\)\]:pb-2 flex flex-col \[@media\(max-height:500px\)_and_\(orientation:landscape\)\]:flex-row items-start \[@media\(max-height:500px\)_and_\(orientation:landscape\)\]:items-center gap-4 sm:gap-6 \[@media\(max-height:500px\)_and_\(orientation:landscape\)\]:gap-6 text-left \[@media\(max-height:500px\)_and_\(orientation:landscape\)\]:h-auto">/,
  `<div className="relative z-10 max-w-[2000px] mx-auto w-full px-4 sm:px-8 pb-4 sm:pb-6 [@media(max-height:500px)_and_(orientation:landscape)]:pb-2 flex flex-col [@media(max-height:500px)_and_(orientation:landscape)]:flex-row items-start [@media(max-height:500px)_and_(orientation:landscape)]:items-center gap-4 sm:gap-6 [@media(max-height:500px)_and_(orientation:landscape)]:gap-6 text-left [@media(max-height:500px)_and_(orientation:landscape)]:h-auto translate-y-8 sm:translate-y-16">`
);

// Replace accordion with Casting and Similar content
const accordionRegex = /\{\/\* 3\. MINIMALIST COLLAPSIBLE ACCORDION PANELS \*\/\}[\s\S]*$/;

const newBottomSection = `{/* CASTING SECTION */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 mt-16 sm:mt-24 space-y-4 text-left">
        <button 
          onClick={() => setExpandedSection(expandedSection === 'casting' ? null : 'casting')}
          className="w-full sm:w-auto px-6 py-4 border border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 rounded-xl text-white font-bold tracking-widest uppercase transition-colors flex items-center justify-between sm:justify-center gap-4 cursor-pointer"
        >
          CASTING
          <ChevronDown className={\`w-5 h-5 transition-transform \${expandedSection === 'casting' ? 'rotate-180' : ''}\`} />
        </button>

        {expandedSection === 'casting' && movie.castDetails && movie.castDetails.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-4">
            {movie.castDetails.map((actor, idx) => (
              <div key={idx} className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
                <div className="aspect-[2/3] bg-zinc-800 w-full relative">
                  {actor.imageUrl ? (
                    <img src={actor.imageUrl} alt={actor.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      <User className="w-10 h-10" />
                    </div>
                  )}
                </div>
                <div className="p-3 flex flex-col text-center">
                  <span className="font-bold text-white text-sm truncate">{actor.role || 'Role'}</span>
                  <span className="text-zinc-400 text-xs truncate mt-1">{actor.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SIMILAR CONTENT (MOVIES ONLY) */}
      {!movie.isTv && movie.similar && movie.similar.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 sm:px-8 mt-12 mb-20 space-y-4 text-left">
          <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-6">Similar Content</h3>
          <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
            {movie.similar.map((sim) => (
              <button
                key={sim.id}
                onClick={() => {
                  window.scrollTo(0, 0);
                  onPlay(sim.id);
                }}
                className="shrink-0 w-32 sm:w-40 group cursor-pointer text-left"
              >
                <div className="aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 relative border border-zinc-800/50 group-hover:border-zinc-500/50 transition-colors">
                  {sim.posterUrl ? (
                    <img src={sim.posterUrl} alt={sim.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="w-8 h-8 text-zinc-700" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </div>
                <h4 className="text-white font-bold text-sm truncate mt-2 group-hover:text-amber-400 transition-colors">{sim.title}</h4>
                <p className="text-zinc-500 text-xs">{sim.year || 'N/A'}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
`;

code = code.replace(accordionRegex, newBottomSection);
fs.writeFileSync('src/components/MovieDetailView.tsx', code, 'utf-8');
console.log("Patched MovieDetailView!");
