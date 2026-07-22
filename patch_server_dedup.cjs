const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const oldCode = `      const imported = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
      mergedMovies = [...imported, ...mergedMovies];
    }
  } catch(e) {
    console.error("Error reading imported_movies.json:", e);
  }
  
  res.json({ success: true, movies: mergedMovies });
});`;

const newCode = `      const imported = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
      mergedMovies = [...imported, ...mergedMovies];
    }
  } catch(e) {
    console.error("Error reading imported_movies.json:", e);
  }
  
  // Deduplicate by ID (first occurrence wins, so imported overrides allMoviesData)
  const map = new Map();
  for (const m of mergedMovies) {
    if (!map.has(m.id)) {
      map.set(m.id, m);
    }
  }
  mergedMovies = Array.from(map.values());
  
  res.json({ success: true, movies: mergedMovies });
});`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('server.ts', code, 'utf-8');
console.log("Patched server.ts with deduplication");
