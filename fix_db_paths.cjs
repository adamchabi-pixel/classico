const fs = require('fs');
let serverCode = fs.readFileSync('server.ts', 'utf-8');

// Replace imported_movies.json DB_PATH to just use process.cwd() for reading
// Wait, I replaced all of them with os.tmpdir() in production.
serverCode = serverCode.replace(/path\.join\(\(process\.env\.NODE_ENV === "production" \? require\("os"\)\.tmpdir\(\) \: process\.cwd\(\)\), "imported_movies\.json"\)/g, 'path.join(process.cwd(), "imported_movies.json")');

fs.writeFileSync('server.ts', serverCode, 'utf-8');
console.log("Restored process.cwd() for imported_movies.json");
