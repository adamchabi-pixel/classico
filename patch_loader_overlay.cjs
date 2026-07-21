const fs = require('fs');
let code = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf-8');

code = code.replace(
  /\{\(isLoading \|\| isStreamLoading\) && \(/,
  '{(isLoading || isStreamLoading || (playbackInfo?.isIframeEmbed && isIframeLoading)) && ('
);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', code, 'utf-8');
console.log("Restored isIframeLoading to loader overlay condition");
