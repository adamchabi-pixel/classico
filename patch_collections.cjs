const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /const finalCollections = \[\s*\.\.\.curatedSagaCollections,\s*\.\.\.dynamicFranchiseCollections,\s*\.\.\.dynamicDirectorCollections\s*\];/;

const newLogic = `    const finalCollections = [
      ...curatedSagaCollections,
      ...dynamicFranchiseCollections,
      ...dynamicDirectorCollections
    ];

    // INJECT CUSTOM CATEGORY MOVIES
    jellyfinMovies.forEach(m => {
      if (m.customCategory && m.customCategory !== "none") {
        let target = finalCollections.find(c => c.title === m.customCategory);
        if (target) {
          // Avoid duplicate pushing
          if (!target.movies.some(existing => existing.id === m.id)) {
            target.movies.push({ ...m, isJellyfin: true });
          }
        } else {
          finalCollections.push({
            id: \`custom-\${m.customCategory.toLowerCase().replace(/[^a-z]/g, '-')}\`,
            title: m.customCategory,
            description: "Catégorie Personnalisée",
            movies: [{ ...m, isJellyfin: true }]
          });
        }
      }
    });`;

code = code.replace(regex, newLogic);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched mappedCollections");
