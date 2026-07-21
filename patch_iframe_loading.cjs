const fs = require('fs');
let code = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf-8');

// Add isIframeLoading state
code = code.replace(
  '  const [isStreamLoading, setIsStreamLoading] = useState(true);',
  '  const [isStreamLoading, setIsStreamLoading] = useState(true);\n  const [isIframeLoading, setIsIframeLoading] = useState(true);'
);

// Reset isIframeLoading in fetchPlaybackData (around line 750)
code = code.replace(
  'setIsLoading(true);',
  'setIsLoading(true);\n      setIsIframeLoading(true);'
);

// Modify the render portion
const renderTarget = `{isLoading || isStreamLoading ? (
        <div className="text-amber-500 flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
      ) : playbackInfo?.iframeSrc ? (
        <div className="absolute inset-0 w-full h-full bg-black z-40 pointer-events-auto flex items-center justify-center">
          <iframe
            src={playbackInfo.iframeSrc}
            allowFullScreen={true}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            className="absolute inset-0 w-full h-full border-0"
            // @ts-ignore
            webkitAllowFullScreen={true}
            // @ts-ignore
            mozAllowFullScreen={true}
          ></iframe>
        </div>
      ) : (
        <div className="text-rose-500 font-mono text-xs p-4 bg-black/80 rounded border border-rose-500/30">
          Source introuvable.
        </div>
      )}`;

const replacement = `{/* Loader overlay */}
      {(isLoading || isStreamLoading || (playbackInfo?.isIframeEmbed && isIframeLoading)) && (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center gap-4 text-amber-500">
          <Loader2 className="w-10 h-10 animate-spin" />
          <div className="text-sm font-mono tracking-widest text-amber-500/80 uppercase">
            Connexion au serveur...
          </div>
        </div>
      )}
      
      {/* Actual player/iframe */}
      {playbackInfo?.iframeSrc ? (
        <div className={\`absolute inset-0 w-full h-full bg-black z-40 pointer-events-auto flex items-center justify-center \${isIframeLoading ? 'opacity-0' : 'opacity-100'}\`}>
          <iframe
            src={playbackInfo.iframeSrc}
            allowFullScreen={true}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            className="absolute inset-0 w-full h-full border-0"
            // @ts-ignore
            webkitAllowFullScreen={true}
            // @ts-ignore
            mozAllowFullScreen={true}
            onLoad={() => setIsIframeLoading(false)}
          ></iframe>
        </div>
      ) : !isLoading && !isStreamLoading ? (
        <div className="absolute inset-0 flex items-center justify-center text-rose-500 font-mono text-xs p-4 bg-black/80 z-30">
          Source introuvable.
        </div>
      ) : null}`;

code = code.replace(renderTarget, replacement);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', code, 'utf-8');
console.log("Patched CinemaPlayerView with iframe loading logic");
