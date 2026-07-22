const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "});\\\\n\\\\n  const allMovies = React.useMemo(() => {",
  "});\\n\\n  const allMovies = React.useMemo(() => {"
);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Fixed App.tsx literal slash n");
