const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `  // For now, hardcode the Odyssey test bypass:
  if (id === "tt33764258" || id.startsWith("tt")) {`;

const replacement = `  // For now, hardcode the Odyssey test bypass:
  const isNumeric = /^\\d+$/.test(id);
  if (id === "tt33764258" || id.startsWith("tt") || isNumeric) {`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
