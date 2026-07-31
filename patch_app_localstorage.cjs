const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

file = file.replace(/const savedProgress = localStorage\.getItem\("classico_progress"\);/g, `let savedProgress = null;
    try { savedProgress = localStorage.getItem("classico_progress"); } catch(e) {}`);

file = file.replace(/const savedHistory = localStorage\.getItem\("classico_history"\);/g, `let savedHistory = null;
      try { savedHistory = localStorage.getItem("classico_history"); } catch(e) {}`);

file = file.replace(/localStorage\.setItem\("classico_history", JSON\.stringify\(updated\)\);/g, `try { localStorage.setItem("classico_history", JSON.stringify(updated)); } catch(e) {}`);

file = file.replace(/localStorage\.setItem\("classico_watchlist", JSON\.stringify\(updated\)\);/g, `try { localStorage.setItem("classico_watchlist", JSON.stringify(updated)); } catch(e) {}`);

file = file.replace(/const saved = localStorage\.getItem\("classico_tmdb_cache"\);/g, `let saved = null; try { saved = localStorage.getItem("classico_tmdb_cache"); } catch(e) {}`);

fs.writeFileSync('src/App.tsx', file);
