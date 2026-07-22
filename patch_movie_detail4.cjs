const fs = require('fs');
let code = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf-8');

if (!code.includes('const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);')) {
  code = code.replace(
    /const \[selectedSeason, setSelectedSeason\] = useState<number \| undefined>\(movie\.seasons\?\.\[0\]\?\.season_number\);/,
    `const [selectedSeason, setSelectedSeason] = useState<number | undefined>(movie.seasons?.[0]?.season_number);
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);`
  );
}

const dropdownRegex = /<div className="relative group">[\s\S]*?<\/div>\s*<\/div>\s*<div className="flex flex-col gap-4 relative z-10">/;

const newDropdown = `<div className="relative">
              <button 
                onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
                className="flex items-center gap-2 text-zinc-300 hover:text-white bg-zinc-900/50 hover:bg-zinc-800 px-4 py-2 rounded-lg transition-colors border border-zinc-800 hover:border-zinc-700 font-bold text-sm tracking-widest uppercase cursor-pointer"
              >
                Season {selectedSeason} <ChevronDown className={\`w-4 h-4 transition-transform \${isSeasonDropdownOpen ? 'rotate-180' : ''}\`} />
              </button>
              
              {isSeasonDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsSeasonDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="max-h-[300px] overflow-y-auto no-scrollbar py-1">
                      {movie.seasons?.map((s: any) => (
                        <button
                          key={s.season_number}
                          onClick={() => {
                            setSelectedSeason(s.season_number);
                            setIsSeasonDropdownOpen(false);
                          }}
                          className={\`w-full text-left px-4 py-3 text-sm font-bold tracking-widest uppercase transition-colors hover:bg-zinc-800 \${selectedSeason === s.season_number ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-300'}\`}
                        >
                          Season {s.season_number}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4 relative z-10">`;

code = code.replace(dropdownRegex, newDropdown);

fs.writeFileSync('src/components/MovieDetailView.tsx', code, 'utf-8');
console.log("Patched MovieDetailView.tsx with click dropdown");
