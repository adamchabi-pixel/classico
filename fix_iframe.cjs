const fs = require('fs');
let code = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

const target = `              <iframe
                src={playbackInfo.iframeSrc}
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                allowFullScreen={true}
                referrerPolicy="origin"
                className="w-full h-full pointer-events-auto"
              ></iframe>`;

const replacement = `              <iframe
                src={playbackInfo.iframeSrc}
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                allowFullScreen={true}
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media;"
                className="w-full h-full pointer-events-auto"
              ></iframe>`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/CinemaPlayerView.tsx', code);
  console.log("Fixed iframe attributes");
} else {
  console.log("Could not find iframe target");
}
