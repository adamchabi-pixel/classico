const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /priority={idx < 10}>>/g,
  'priority={idx < 10}>'
);
code = code.replace(
  /priority={idx < 6}>>/g,
  'priority={idx < 6}>'
);
code = code.replace(
  /priority={idx < 8}>>/g,
  'priority={idx < 8}>'
);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Syntax fixed");
