const fs = require('fs');
let code = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf-8');

// Add a fallback timeout for iframe loading
const searchString = `            setPlaybackInfo(iframeResult);
            setIsLoading(false);
            return;
          }`;

const replacement = `            setPlaybackInfo(iframeResult);
            setIsLoading(false);
            // Fallback timeout in case onLoad doesn't fire
            setTimeout(() => {
              setIsIframeLoading(false);
            }, 3000);
            return;
          }`;

code = code.replace(searchString, replacement);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', code, 'utf-8');
console.log("Patched iframe loader fallback timeout");
