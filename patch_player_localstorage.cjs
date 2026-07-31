const fs = require('fs');
let file = fs.readFileSync('src/components/CinemaPlayerView.tsx', 'utf8');

file = file.replace(/localStorage\.setItem\(/g, `try { localStorage.setItem( `);
// Wait, regex replacing `localStorage.setItem(` with `try { localStorage.setItem(` is dangerous without closing brace!

// Better to write a precise script to replace without breaking brackets.
