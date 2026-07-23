const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf-8');

code = code.replace(/const valid = combined\.filter\(\(m: any\) => m\.media_type === "movie" \|\| m\.media_type === "tv"\);/g, 
`const validRaw = combined.filter((m: any) => m.media_type === "movie" || m.media_type === "tv");
          const uniqueIds = new Set();
          const valid = [];
          for (const m of validRaw) {
            if (!uniqueIds.has(m.id)) {
              uniqueIds.add(m.id);
              valid.push(m);
            }
          }`);

fs.writeFileSync('src/main.tsx', code, 'utf-8');
console.log("Patched main.tsx deduplication");
