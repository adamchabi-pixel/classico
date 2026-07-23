const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/import \{ AdminWishlist \} from "\.\/components\/AdminWishlist";\n/g, '');
code = code.replace(/\{isAdminUnlocked && \(\n\s*<AdminWishlist onAdded=\{\(\) => \{ loadJellyfinLibrary\(\); \}\} categories=\{mappedCollections\.map\(c => c\.title\)\} allMovies=\{allMovies\} \/>\n\s*\)\}\n/g, '');

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("AdminWishlist removed from App");
