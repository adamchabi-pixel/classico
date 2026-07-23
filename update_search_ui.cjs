const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `<p className="text-xs sm:text-sm text-zinc-400 font-mono">
                  {searchedMovies.length} cinematic masterpiece{searchedMovies.length > 1 ? "s" : ""} found
                </p>`;

const replacement = `<div className="flex items-center gap-3">
                  <p className="text-xs sm:text-sm text-zinc-400 font-mono">
                    {searchedMovies.length} cinematic masterpiece{searchedMovies.length > 1 ? "s" : ""} found
                  </p>
                  {isSearchingTmdb && (
                    <div className="w-4 h-4 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin" />
                  )}
                </div>`;

code = code.replace(target, replacement);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Updated search UI with spinner");
