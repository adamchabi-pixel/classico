const fs = require('fs');
let code = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf-8');

code = code.replace(
  'import EmbedPlayer from "./EmbedPlayer";',
  'import EmbedPlayer from "./EmbedPlayer";\nimport { allMoviesData } from "../data/all_movies";'
);

// Also let's fix the finally block so that isStreamLoading is set to false as well, to prevent future infinite loading
code = code.replace(
  '        if (active) {\n          setIsLoading(false);\n        }',
  '        if (active) {\n          setIsLoading(false);\n          setIsStreamLoading(false);\n        }'
);

fs.writeFileSync('src/components/CinemaPlayerView.tsx', code, 'utf-8');
console.log("Patched imports and finally block");
