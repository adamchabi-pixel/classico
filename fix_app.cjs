const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf-8');

appCode = appCode.replace(
  /const \[tmdbCache, setTmdbCache\] = React\.useState<Movie\[\]>\(\[\]\);/,
  'const [tmdbCache, setTmdbCache] = React.useState<Movie[]>([]);\n  const [movieLoadError, setMovieLoadError] = React.useState<string | null>(null);'
);

appCode = appCode.replace(
  /fetch\(\`\/api\/movie\/\$\{targetMovieId\}\`\)\n\s*\.then\(res => res\.json\(\)\)\n\s*\.then\(data => \{/,
  'setMovieLoadError(null);\n      fetch(`/api/movie/${targetMovieId}`)\n        .then(res => res.json())\n        .then(data => {'
);

appCode = appCode.replace(
  /return newCache;\n\s*\}\);\n\s*\}\n\s*\}\)\n\s*\.catch\(err => console\.error\("Error fetching missing movie data:", err\)\);/,
  `return newCache;
            });
          } else {
            setMovieLoadError(data.error || "Failed to load movie data.");
          }
        })
        .catch(err => {
          console.error("Error fetching missing movie data:", err);
          setMovieLoadError(err.message);
        });`
);

appCode = appCode.replace(
  /<Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" \/>\n\s*<p className="text-zinc-400 font-mono text-sm tracking-widest uppercase">Loading Data\.\.\.<\/p>/,
  `{movieLoadError ? (
                    <div className="flex flex-col items-center">
                      <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
                      <p className="text-red-400 font-mono text-sm tracking-widest uppercase">{movieLoadError}</p>
                      <button onClick={() => navigateTo("/")} className="mt-6 px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700">Go Back</button>
                    </div>
                  ) : (
                    <>
                      <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" />
                      <p className="text-zinc-400 font-mono text-sm tracking-widest uppercase">Loading Data...</p>
                    </>
                  )}`
);

fs.writeFileSync('src/App.tsx', appCode, 'utf-8');
console.log("App.tsx error handling fixed");
