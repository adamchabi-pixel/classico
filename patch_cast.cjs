const fs = require('fs');
let code = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf-8');

code = code.replace(/\{fullMovie\.castDetails \? fullMovie\.castDetails\.map/g, `{fullMovie.castDetails && fullMovie.castDetails.length > 0 ? fullMovie.castDetails.map`);

fs.writeFileSync('src/components/MovieDetailView.tsx', code, 'utf-8');
console.log("Patched cast details length check");
