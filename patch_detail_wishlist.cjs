const fs = require('fs');
let code = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf-8');

const regexIsTv = /<div className="flex gap-4 border-b border-zinc-800 pb-2 overflow-x-auto no-scrollbar">/;
const replacementIsTv = `<div className="flex items-center gap-3 mb-2">
                  <button onClick={() => console.log('Added to list')} className="inline-flex items-center justify-center gap-2 bg-neutral-800/80 hover:bg-neutral-700/80 text-white px-4 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all active:scale-95 cursor-pointer border border-neutral-700/50 hover:border-neutral-500/50">
                    <Plus className="w-4 h-4" />
                    Ma Liste
                  </button>
                </div>
                <div className="flex gap-4 border-b border-zinc-800 pb-2 overflow-x-auto no-scrollbar">`;
code = code.replace(regexIsTv, replacementIsTv);

const regexMovie = /<Play className="w-4 h-4 fill-current" \/>\s*Play\s*<\/button>/m;
const replacementMovie = `<Play className="w-4 h-4 fill-current" />
                  Play
                </button>
                <button onClick={() => console.log('Added to list')} className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-neutral-800/80 hover:bg-neutral-700/80 text-white rounded-full transition-all active:scale-95 cursor-pointer border border-neutral-700/50 hover:border-neutral-500/50 shrink-0">
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>`;
code = code.replace(regexMovie, replacementMovie);

if (!code.includes("import {") || !code.includes("Plus")) {
    code = code.replace(/import \{([^}]+)\} from 'lucide-react';/, "import {$1, Plus} from 'lucide-react';");
}

fs.writeFileSync('src/components/MovieDetailView.tsx', code, 'utf-8');
console.log("Patched MovieDetailView wishlist.");
