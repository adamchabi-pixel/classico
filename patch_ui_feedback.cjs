const fs = require('fs');
let code = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf-8');

// 1. Fix hero height and padding
code = code.replace(
  /h-\[75vh\] md:h-\[85vh\] min-h-\[600px\] sm:min-h-\[700px\]/g,
  'h-[65vh] md:h-[80vh] min-h-[500px]'
);
code = code.replace(
  /pb-16 sm:pb-24/g,
  'pb-8 sm:pb-12'
);

// 2. Synopsis text size
code = code.replace(
  /text-xs sm:text-sm leading-relaxed max-w-2xl font-sans font-light line-clamp-3 sm:line-clamp-4 mt-2/g,
  'text-[11px] sm:text-xs leading-relaxed max-w-2xl font-sans font-light line-clamp-3 mt-2'
);

// 3. Move Casting Button into Hero
const btnArea = `                <button onClick={() => console.log('Added to list')} className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-neutral-800/80 hover:bg-neutral-700/80 text-white rounded-full transition-all active:scale-95 cursor-pointer border border-neutral-700/50 hover:border-neutral-500/50 shrink-0">
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>`;
const newBtnArea = btnArea + `
              
              {/* NEW CASTING BUTTON LOCATION */}
              {fullMovie.castDetails && fullMovie.castDetails.length > 0 && (
                <button 
                  onClick={() => setExpandedSection(expandedSection === 'casting' ? null : 'casting')}
                  className="mt-3 sm:mt-4 px-3 py-1.5 sm:px-4 sm:py-2 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 text-[10px] sm:text-[11px] font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 rounded-lg cursor-pointer border border-zinc-800/50 backdrop-blur-sm w-fit"
                >
                  CASTING
                  <ChevronDown className={\`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform \${expandedSection === 'casting' ? 'rotate-180' : ''}\`} />
                </button>
              )}`;
code = code.replace(btnArea, newBtnArea);

// 4. Remove old Casting button and adjust grid / padding
const oldCastingSectionRegex = /<div className="max-w-4xl mx-auto px-4 sm:px-8 mt-16 sm:mt-24 space-y-4 text-left">[\s\S]*?<button[\s\S]*?CASTING[\s\S]*?<\/button>\s*\{expandedSection === 'casting' && fullMovie\.castDetails && fullMovie\.castDetails\.length > 0 && \(/;

const newCastingSection = `<div className="max-w-4xl mx-auto px-4 sm:px-8 mt-2 sm:mt-4 text-left">
        {expandedSection === 'casting' && fullMovie.castDetails && fullMovie.castDetails.length > 0 && (`;
        
code = code.replace(oldCastingSectionRegex, newCastingSection);

// Adjust actor cards sizing
code = code.replace(
  /grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-4/g,
  'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 pt-2'
);
code = code.replace(
  /className="font-bold text-white text-sm truncate"/g,
  'className="font-bold text-white text-[11px] sm:text-xs truncate"'
);
code = code.replace(
  /className="text-zinc-400 text-xs truncate mt-1"/g,
  'className="text-zinc-400 text-[9px] sm:text-[10px] truncate mt-0.5"'
);
code = code.replace(
  /className="p-3 flex flex-col text-center"/g,
  'className="p-1.5 sm:p-2 flex flex-col text-center"'
);

// 5. TV Episodes spacing
code = code.replace(
  /<div className="max-w-4xl mx-auto px-4 sm:px-8 mt-8 space-y-6 text-left">/g,
  '<div className="max-w-4xl mx-auto px-4 sm:px-8 mt-4 space-y-4 text-left">'
);
code = code.replace(
  /<div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-4 relative z-20">/g,
  '<div className="flex items-center justify-between border-b border-zinc-800 pb-1 mb-2 relative z-20">'
);

// 6. Similar Content formatting
const oldSimilar = /<h3 className="text-lg font-bold text-white uppercase tracking-widest mb-6">Similar Content<\/h3>\s*<div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">/;

const newSimilar = `<div className="flex items-center justify-between mb-4">
            <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-widest">Similar Content</h3>
            <div className="flex gap-2">
              <button onClick={() => { const el = document.getElementById('similar-scroll'); if (el) el.scrollBy({ left: -300, behavior: 'smooth' }); }} className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 transition-colors cursor-pointer text-white">&lt;</button>
              <button onClick={() => { const el = document.getElementById('similar-scroll'); if (el) el.scrollBy({ left: 300, behavior: 'smooth' }); }} className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 transition-colors cursor-pointer text-white">&gt;</button>
            </div>
          </div>
          <div id="similar-scroll" className="flex overflow-x-auto gap-3 sm:gap-4 pb-4 no-scrollbar scroll-smooth">`;

code = code.replace(oldSimilar, newSimilar);

code = code.replace(
  /<div className="max-w-4xl mx-auto px-4 sm:px-8 mt-12 mb-20 space-y-4 text-left">/g,
  '<div className="max-w-[2000px] w-full mx-auto px-4 sm:px-8 mt-6 sm:mt-12 mb-20 space-y-2 text-left">'
);

// Import ChevronLeft, ChevronRight if we want to use them, but we used &lt; and &gt; instead to be safe with imports.

fs.writeFileSync('src/components/MovieDetailView.tsx', code, 'utf-8');
console.log("Patched UI feedback!");
