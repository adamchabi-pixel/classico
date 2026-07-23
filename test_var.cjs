const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace(/const \[tmdbCache, setTmdbCache\] = useState<Movie\[\]>/g, 'var [tmdbCache, setTmdbCache] = useState<Movie[]>');
fs.writeFileSync('src/App.tsx', code, 'utf-8');
