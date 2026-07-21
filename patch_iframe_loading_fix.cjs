const fs = require('fs');
let code = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf-8');

const target = `            setPlaybackInfo(iframeResult);
            setIsLoading(false);
            // Fallback timeout in case onLoad doesn't fire
            setTimeout(() => {
              setIsIframeLoading(false);
            }, 3500);
            return;`;

const replacement = `            setPlaybackInfo(iframeResult);
            setIsLoading(false);
            setIsStreamLoading(false); // Make sure to disable stream loading
            // Fallback timeout in case onLoad doesn't fire
            setTimeout(() => {
              setIsIframeLoading(false);
            }, 3500);
            return;`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', code, 'utf-8');
console.log("Patched iframe stream loading state");
