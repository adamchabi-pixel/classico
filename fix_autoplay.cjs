const fs = require('fs');
let code = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

const target = `            controls={false}
            autoPlay={adClicks >= 2}
            muted={muted}`;

const replacement = `            controls={false}
            autoPlay={adClicks >= 2 && !playbackInfo?.isIframeEmbed}
            muted={muted}`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/CinemaPlayerView.tsx', code);
  console.log("Fixed autoplay");
} else {
  console.log("Could not find autoplay target");
}
