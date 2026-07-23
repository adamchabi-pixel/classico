const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /const targetMovieId = React\.useMemo\(\(\) => \{[\s\S]*?return targetId;\s*\}, \[routePath\]\);/m;
const replacement = `const targetMovieId = React.useMemo(() => {
    let targetId = "";
    if (routePath.startsWith("/movie/")) {
      targetId = routePath.slice("/movie/".length);
    } else if (routePath.startsWith("/player/")) {
      targetId = routePath.slice("/player/".length);
    }
    const tvMatch = targetId.match(/^(.*-tv)-S\\d+E\\d+$/);
    if (tvMatch) {
      targetId = tvMatch[1];
    }
    return targetId;
  }, [routePath]);`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched App.tsx targetMovieId.");
