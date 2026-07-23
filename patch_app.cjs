const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes('const [movieLoadError')) {
  code = code.replace(/const \[tmdbCache, setTmdbCache\] = useState<Movie\[\]>\(\(\) => \{/, 'const [movieLoadError, setMovieLoadError] = useState<string | null>(null);\n  const [tmdbCache, setTmdbCache] = useState<Movie[]>(() => {');
}

code = code.replace(/fetch\(\`\/api\/movie\/\$\{targetMovieId\}\`\)\n\s*\.then\(res => res\.json\(\)\)\n\s*\.then\(data => \{/g, 'setMovieLoadError(null);\n      fetch(`/api/movie/${targetMovieId}`)\n        .then(res => res.json())\n        .then(data => {');

code = code.replace(/return newCache;\n\s*\}\);\n\s*\}\n\s*\}\)\n\s*\.catch\(err => console\.error\("Error fetching missing movie data:", err\)\);/g, `return newCache;
            });
          } else {
            setMovieLoadError(data.error || "Failed to load movie data.");
          }
        })
        .catch(err => {
          console.error("Error fetching missing movie data:", err);
          setMovieLoadError(err.message);
        });`);

code = code.replace(/<div className="py-20 text-center max-w-sm mx-auto space-y-4">\n\s*<p className="text-zinc-400 font-mono">Loading movie data\.\.\.<\/p>\n\s*<\/div>/g, 
`{movieLoadError ? (
                <div className="py-20 text-center max-w-sm mx-auto space-y-4">
                  <div className="w-16 h-16 rounded-full bg-red-900/30 border border-red-500/30 flex items-center justify-center mx-auto text-red-500 mb-4"><AlertCircle className="w-8 h-8" /></div>
                  <p className="text-red-400 font-mono text-sm tracking-widest uppercase">{movieLoadError}</p>
                  <button onClick={() => navigateTo("/")} className="mt-6 px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700">Go Back</button>
                </div>
              ) : (
                <div className="py-20 text-center max-w-sm mx-auto space-y-4">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-4" />
                  <p className="text-zinc-400 font-mono text-sm tracking-widest uppercase">Loading movie data...</p>
                </div>
              )}`);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched App.tsx for movieLoadError");
