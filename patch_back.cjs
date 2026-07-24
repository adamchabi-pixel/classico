const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /const goBackOrHome = \(\) => \{[\s\S]*?navigateTo\("\/"\);\s*\}\s*\};/,
  `const goBackOrHome = () => {
    // Relying on history.back() in an iframe often fails.
    // Instead, navigate manually depending on where we came from, or just go home.
    navigateTo("/");
  };`
);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched back button to always go home for now");
