const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /const goBackOrHome = \(\) => \{[\s\S]*?navigateTo\("\/"\);\s*\}\s*\};/,
  `const goBackOrHome = () => {
    if (Object.keys(routeScrollPositions).length > 0 || window.history.length > 2) {
      window.history.back();
    } else {
      navigateTo("/");
    }
  };`
);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched goBackOrHome in App.tsx");
