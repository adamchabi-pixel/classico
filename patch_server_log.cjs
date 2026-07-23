const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  /app\.get\("\/api\/movie\/:id", async \(req, res\) => \{(\s+)try \{(\s+)const \{ id \} = req\.params;/,
  'app.get("/api/movie/:id", async (req, res) => {$1try {$2const { id } = req.params;$2console.log("Requested movie details for ID:", id);'
);

fs.writeFileSync('server.ts', code, 'utf-8');
console.log("Patched server log");
