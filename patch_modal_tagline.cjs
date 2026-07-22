const fs = require('fs');
let code = fs.readFileSync('src/components/MovieModal.tsx', 'utf-8');

const regex = /<motion\.h2[\s\S]*?>\s*\{movie\.title\}\s*<\/motion\.h2>/;
const newCode = `<motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl sm:text-5xl font-cinzel font-bold text-white tracking-widest uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                >
                  {movie.title}
                </motion.h2>
                {movie.tagline && (
                  <p className="text-zinc-300 font-sans text-sm italic opacity-90 mt-1 mb-2">
                    "{movie.tagline}"
                  </p>
                )}`;
                
code = code.replace(regex, newCode);
fs.writeFileSync('src/components/MovieModal.tsx', code, 'utf-8');
console.log("Patched MovieModal.tsx tagline.");
