const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Find the last AnimatePresence and properly close it
const idx = content.lastIndexOf('</AnimatePresence>');
if (idx !== -1) {
   content = content.slice(0, idx) + '</AnimatePresence>\n    </div>\n  );\n}\n';
   fs.writeFileSync('src/App.tsx', content);
   console.log("Patched");
}
