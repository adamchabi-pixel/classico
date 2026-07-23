const fs = require('fs');
let code = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf-8');

code = code.replace(
  /\{fullMovie\.castDetails && fullMovie\.castDetails\.length > 0 && \(/g,
  '{((fullMovie.castDetails && fullMovie.castDetails.length > 0) || (fullMovie.cast && fullMovie.cast.length > 0)) && ('
);

let castDetailsRendering = `        {expandedSection === 'casting' && ((fullMovie.castDetails && fullMovie.castDetails.length > 0) || (fullMovie.cast && fullMovie.cast.length > 0)) && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 pt-2">
            {fullMovie.castDetails ? fullMovie.castDetails.map((actor, idx) => (
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
                <div className="p-1.5 sm:p-2 flex flex-col text-center">
                  <span className="font-bold text-white text-[11px] sm:text-xs truncate">{actor.role || 'Role'}</span>
                  <span className="text-zinc-400 text-[9px] sm:text-[10px] truncate mt-0.5">{actor.name}</span>
                </div>
              </div>
            )) : fullMovie.cast?.map((actorStr, idx) => (
              <div key={idx} className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
                <div className="aspect-[2/3] bg-zinc-800 w-full relative">
                  <div className="w-full h-full flex items-center justify-center text-zinc-600">
                    <User className="w-10 h-10" />
                  </div>
                </div>
                <div className="p-1.5 sm:p-2 flex flex-col text-center">
                  <span className="font-bold text-white text-[11px] sm:text-xs truncate">{actorStr}</span>
                </div>
              </div>
            ))}
          </div>
        )}`;

code = code.replace(
  /\{expandedSection === 'casting' && fullMovie\.castDetails && fullMovie\.castDetails\.length > 0 && \([\s\S]*?\)\}/g,
  castDetailsRendering
);

fs.writeFileSync('src/components/MovieDetailView.tsx', code, 'utf-8');
console.log("Casting fixed");
