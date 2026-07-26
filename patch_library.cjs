const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryView.tsx', 'utf8');

const targetPlatforms = `const PLATFORMS = [
  { id: 8, name: "Netflix", logo: "https://image.tmdb.org/t/p/original/t2yyOV40IZaSbkZCRdvcq0R1xbb.jpg" },
  { id: 1899, name: "Max", logo: "https://image.tmdb.org/t/p/original/61ymgJt2aWz8kE5r7D7GkIu6lA0.jpg" },
  { id: 337, name: "Disney+", logo: "https://image.tmdb.org/t/p/original/7rwgEs15tFwyR9NPQ5aF42z7Rcw.jpg" },
  { id: 15, name: "Hulu", logo: "https://image.tmdb.org/t/p/original/w2f97iHNenw7pE5J3Dte6T6q3oV.jpg" },
  { id: 119, name: "Prime Video", logo: "https://image.tmdb.org/t/p/original/ifXQ6G3T5O2C0j5p8W03x9Y5o53.jpg" },
  { id: 350, name: "Apple TV+", logo: "https://image.tmdb.org/t/p/original/6uhKBfmtzFqOcLousHwZuzcrHib.jpg" },
  { id: 531, name: "Paramount+", logo: "https://image.tmdb.org/t/p/original/h5DcR0J2EESLitlzjjcbGl2gWEU.jpg" }
];`;

const replacementPlatforms = `const PLATFORMS = [
  { id: 8, name: "Netflix", logo: "https://image.tmdb.org/t/p/original/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg" },
  { id: 1899, name: "Max", logo: "https://image.tmdb.org/t/p/original/61ymgJt2aWz8kE5r7D7GkIu6lA0.jpg" },
  { id: 337, name: "Disney+", logo: "https://image.tmdb.org/t/p/original/7rwgEs15tFwyR9NPQ5aF42z7Rcw.jpg" },
  { id: 15, name: "Hulu", logo: "https://image.tmdb.org/t/p/original/bxBlRPEPpMVDc4jMhSrTf2339DW.jpg" },
  { id: 9, name: "Prime Video", logo: "https://image.tmdb.org/t/p/original/pvske1MyAoymrs5bguRfVqYiM9a.jpg" },
  { id: 350, name: "Apple TV+", logo: "https://image.tmdb.org/t/p/original/mcbz1LgtErU9p4UdbZ0rG6RTWHX.jpg" },
  { id: 531, name: "Paramount+", logo: "https://image.tmdb.org/t/p/original/h5DcR0J2EESLitlzjjcbGl2gWEU.jpg" }
];`;
content = content.replace(targetPlatforms, replacementPlatforms);

const targetRender = `  return (
    <motion.div
      key="tab-collections"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full flex flex-col min-h-screen pb-20 pt-20 px-4 sm:px-8 max-w-[2000px] mx-auto gap-8"
    >
      <div className="flex flex-col gap-6">
          <h2 className="text-3xl font-bold text-white tracking-wider uppercase font-cinzel">Popular Movies</h2>
          
          {/* Platforms Band */}
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 items-center">
             <button 
                 onClick={() => setActivePlatform(null)}
                 className={\`px-6 py-2 rounded-full font-bold whitespace-nowrap transition-all \${activePlatform === null ? 'bg-amber-500 text-black' : 'bg-zinc-900 text-white hover:bg-zinc-800'}\`}
             >
                 All
             </button>
             {PLATFORMS.map(p => (
                 <button
                     key={p.id}
                     onClick={() => setActivePlatform(p.id)}
                     className={\`flex-shrink-0 relative rounded-xl overflow-hidden transition-all duration-300 \${activePlatform === p.id ? 'ring-2 ring-amber-500 scale-105' : 'hover:scale-105 hover:ring-2 hover:ring-white/30'}\`}
                     style={{ width: '80px', height: '45px' }}
                 >
                     <img src={p.logo} alt={p.name} className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-black/20" />
                 </button>
             ))}
          </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start w-full">
         {/* Sidebar Genres */}
         <div className="w-full md:w-64 flex-shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible no-scrollbar pb-4 md:pb-0">
             <button
                 onClick={() => setActiveGenre(null)}
                 className={\`px-4 py-2 text-left rounded-lg text-sm font-semibold transition-all whitespace-nowrap \${activeGenre === null ? 'bg-white/10 text-amber-500' : 'text-zinc-400 hover:text-white hover:bg-white/5'}\`}
             >
                 All Genres
             </button>
             {GENRES.map(g => (
                 <button
                     key={g.id}
                     onClick={() => setActiveGenre(g.id)}
                     className={\`px-4 py-2 text-left rounded-lg text-sm font-semibold transition-all whitespace-nowrap \${activeGenre === g.id ? 'bg-white/10 text-amber-500' : 'text-zinc-400 hover:text-white hover:bg-white/5'}\`}
                 >
                     {g.name}
                 </button>
             ))}
         </div>

         {/* Grid */}
         <div className="flex-1 w-full">`;

const replacementRender = `  return (
    <motion.div
      key="tab-collections"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full flex flex-col md:flex-row min-h-screen pb-20 pt-[90px] px-4 sm:px-8 max-w-[2000px] mx-auto gap-6 sm:gap-10"
    >
      {/* Sidebar Genres */}
      <div className="w-full md:w-48 xl:w-56 flex-shrink-0 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto no-scrollbar pb-4 md:pb-0 md:sticky md:top-[90px] md:max-h-[calc(100vh-120px)] border-b md:border-b-0 md:border-r border-zinc-800/50 md:pr-4">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 hidden md:block px-2">Genres</div>
          <button
              onClick={() => setActiveGenre(null)}
              className={\`px-4 py-2.5 text-left rounded-xl text-sm font-medium transition-all whitespace-nowrap \${activeGenre === null ? 'bg-amber-500/10 text-amber-500' : 'text-zinc-400 hover:text-white hover:bg-white/5'}\`}
          >
              All Genres
          </button>
          {GENRES.map(g => (
              <button
                  key={g.id}
                  onClick={() => setActiveGenre(g.id)}
                  className={\`px-4 py-2.5 text-left rounded-xl text-sm font-medium transition-all whitespace-nowrap \${activeGenre === g.id ? 'bg-amber-500/10 text-amber-500' : 'text-zinc-400 hover:text-white hover:bg-white/5'}\`}
              >
                  {g.name}
              </button>
          ))}
      </div>

      <div className="flex-1 flex flex-col gap-8 w-full min-w-0">
          <div className="flex flex-col gap-6">
              <h2 className="text-3xl font-bold text-white tracking-wider uppercase font-cinzel">Popular Movies</h2>
              
              {/* Platforms Band */}
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 items-center">
                 <button 
                     onClick={() => setActivePlatform(null)}
                     className={\`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all \${activePlatform === null ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-zinc-900 text-white hover:bg-zinc-800'}\`}
                 >
                     All
                 </button>
                 {PLATFORMS.map(p => (
                     <button
                         key={p.id}
                         onClick={() => setActivePlatform(p.id)}
                         className={\`flex-shrink-0 relative rounded-xl overflow-hidden transition-all duration-300 \${activePlatform === p.id ? 'ring-2 ring-amber-500 scale-110 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'hover:scale-105 hover:ring-2 hover:ring-white/30'}\`}
                         style={{ width: '56px', height: '56px' }}
                     >
                         <img src={p.logo} alt={p.name} className="w-full h-full object-cover" />
                     </button>
                 ))}
              </div>
          </div>

          {/* Grid */}`;

content = content.replace(targetRender, replacementRender);

const targetRenderEnd = `         </div>
      </div>
    </motion.div>`;
const replacementRenderEnd = `      </div>
    </motion.div>`;

content = content.replace(targetRenderEnd, replacementRenderEnd);
fs.writeFileSync('src/components/LibraryView.tsx', content);
