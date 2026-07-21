const fs = require('fs');
let code = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf-8');

// Replace exact string
code = code.replace(
  '{(isLoading || isStreamLoading || (playbackInfo?.isIframeEmbed && isIframeLoading)) && (',
  '{(isLoading || isStreamLoading) && ('
);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', code, 'utf-8');
console.log("Removed isIframeLoading from overlay (retry)");
