const fs = require('fs');
let code = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf-8');

code = code.replace(
  /\{availableServers && availableServers\.length > 1 && \(\s*<\/div>\s*<div className="flex items-center gap-3">/g,
  `{availableServers && availableServers.length > 1 && (
            <button
              onClick={() => {
                const nextIndex = (activeServerIndex + 1) % availableServers.length;
                setActiveServerIndex(nextIndex);
                if (playbackInfo) {
                  setPlaybackInfo({
                    ...playbackInfo,
                    iframeSrc: availableServers[nextIndex].url
                  });
                }
              }}
              className="pointer-events-auto px-4 py-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all cursor-pointer flex items-center justify-center backdrop-blur-md"
              title="Changer de serveur"
            >
              <span className="text-sm font-medium">Serveur {activeServerIndex + 1} : {availableServers[activeServerIndex]?.name || ''}</span>
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-3">`
);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', code, 'utf-8');
console.log("Player fixed");
