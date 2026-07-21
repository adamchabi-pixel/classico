const fs = require('fs');
let code = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf-8');

code = code.replace('            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"', 
                    '            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"\n            onLoad={() => setIsIframeLoading(false)}');

fs.writeFileSync('src/components/CinemaPlayerView.tsx', code, 'utf-8');
console.log("Restored onLoad for iframe");
