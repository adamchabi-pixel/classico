const fs = require('fs');
let code = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

const target = `        {playbackInfo?.isIframeEmbed && playbackInfo.iframeSrc && (
          <div className="absolute inset-0 w-full h-full z-40 bg-black flex flex-col justify-center items-center">
            <iframe
              src={playbackInfo.iframeSrc}
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              allowFullScreen={true}
              referrerPolicy="origin"
              className="w-full h-full pointer-events-auto"
            ></iframe>
          </div>
        )}`;

const replacement = `        {playbackInfo?.isIframeEmbed && playbackInfo.iframeSrc && (
          <div className="absolute inset-0 w-full z-40 bg-black flex flex-col justify-center items-center aspect-video" style={{ aspectRatio: '16/9' }}>
            <iframe
              src={playbackInfo.iframeSrc}
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              allowFullScreen={true}
              referrerPolicy="origin"
              className="w-full h-full pointer-events-auto aspect-video"
              style={{ aspectRatio: '16/9' }}
            ></iframe>
          </div>
        )}`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/CinemaPlayerView.tsx', code);
  console.log('Successfully updated iframe component.');
} else {
  console.log('Target string not found!');
}
