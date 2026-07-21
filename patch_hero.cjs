const fs = require('fs');
let appTsx = fs.readFileSync('src/App.tsx', 'utf-8');

const startIdx = appTsx.indexOf('const loadJellyfinHeroMovie = async () => {');
const endString = 'tryFetchHero();\n  };';
const endIdx = appTsx.indexOf(endString, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  appTsx = appTsx.substring(0, startIdx) + 
           'const loadJellyfinHeroMovie = async () => {};' + 
           appTsx.substring(endIdx + endString.length);
  fs.writeFileSync('src/App.tsx', appTsx, 'utf-8');
  console.log("Successfully removed loadJellyfinHeroMovie implementation");
} else {
  console.log("Could not find block boundaries");
}
