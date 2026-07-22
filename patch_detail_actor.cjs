const fs = require('fs');
let code = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf-8');

code = code.replace(/\{actor\.split\(" "\)\.map\(n => n\[0\]\)\.join\(""\)\.slice\(0, 2\)\}/g, `{typeof actor === "string" ? actor.split(" ").map(n => n[0]).join("").slice(0, 2) : "A"}`);

fs.writeFileSync('src/components/MovieDetailView.tsx', code, 'utf-8');
console.log("Patched MovieDetailView actor split.");
