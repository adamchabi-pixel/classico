const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf-8');

const regex = /const \[r1, r2\] = await Promise\.all\(\[\s*fetch\(\`https:\/\/api\.themoviedb\.org\/3\/search\/multi\?query=\$\{encodeURIComponent\(query\)\}&language=en-US&page=1\`[^\)]+\)\),\s*fetch\(\`https:\/\/api\.themoviedb\.org\/3\/search\/multi\?query=\$\{encodeURIComponent\(query\)\}&language=en-US&page=2\`[^\)]+\)\)\s*\]\);\s*const d1 = await r1\.json\(\);\s*const d2 = r2\.ok \? await r2\.json\(\) : \{ results: \[\] \};\s*const combined = \[\.\.\.\(d1\.results \|\| \[\]\), \.\.\.\(d2\.results \|\| \[\]\)\];/m;

const replacement = `const r1 = await fetch(\`https://api.themoviedb.org/3/search/multi?query=\${encodeURIComponent(query)}&language=en-US&page=1\`, { headers: { "Authorization": \`Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhNDZhYjQxYTI5MmZhY2FkZmQ3ZTg1ZjBmZjIxMzEwOSIsIm5iZiI6MTc4NDQxNDMwOS4zNTIsInN1YiI6IjZhNWMwMDY1MjNhOTJiOWM2MTc3OTc2NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5km-ffvJ5u3te9Wz4cv9rIl6QSthypDbCJsBVs9GxVs\`, "Accept": "application/json" } });
          const d1 = await r1.json();
          const combined = [...(d1.results || [])];`;

if (regex.test(code)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('src/main.tsx', code, 'utf-8');
  console.log("Patched main.tsx search to only fetch 1 page.");
} else {
  console.log("Regex not matched in main.tsx");
}
