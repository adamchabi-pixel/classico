const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldLogic = `          if (collection.id === "trending-now" || collection.id === "comedy-gold" || collection.id === "mind-bending-mysteries" || collection.id === "mafia-movies") {
            return movie;
          }
          return null;`;

const newLogic = `          // Always return the TMDB movie so the collection is full, even if not found locally
          return {
            ...movie,
            isIframeEmbed: true,
            iframeSrc: ""
          };`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Fixed collections to always return TMDB movies");
