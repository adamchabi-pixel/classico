const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Add state
const stateRegex = /const \[isAdminUnlocked, setIsAdminUnlockedState\] = useState[^\n]+;/;
const newState = `const [isAdminUnlocked, setIsAdminUnlockedState] = useState(() => localStorage.getItem("classico_admin_unlocked") === "true");
  const [collectionMods, setCollectionMods] = useState({ deletedCollections: [], addedMovies: {}, removedMovies: {} });`;
code = code.replace(stateRegex, newState);

// Fetch mods in loadJellyfinLibrary
const loadJellyfinLibraryRegex = /setJellyfinHeroMovies\(uniqueHeroes\);\n\s*\}/;
const newLoadJellyfinLibrary = `setJellyfinHeroMovies(uniqueHeroes);
        }
        
        // Load mods
        fetch("/api/admin/collections/modifications").then(r => r.json()).then(mdata => {
          if (mdata.success) setCollectionMods(mdata.modifications);
        }).catch(()=>{});`;
code = code.replace(loadJellyfinLibraryRegex, newLoadJellyfinLibrary);

// Apply mods to finalCollections
const injectRegex = /\/\/ INJECT CUSTOM CATEGORY MOVIES/;
const newInject = `// APPLY COLLECTION MODS
    const mods = collectionMods || { deletedCollections: [], addedMovies: {}, removedMovies: {} };
    
    // INJECT CUSTOM CATEGORY MOVIES`;

code = code.replace(injectRegex, newInject);

const filterRegex = /return finalCollections\.map\(\(col\) => \{/;
const newFilter = `
    let filteredCollections = finalCollections.filter(c => !mods.deletedCollections.includes(c.id) && !mods.deletedCollections.includes(c.title));
    
    return filteredCollections.map((col) => {
      // Apply manual movie additions from mods (assuming movie exists in jellyfinMovies or allMoviesData)
      let customAdded = (mods.addedMovies[col.id] || []).map(id => jellyfinMovies.find(m => String(m.id) === String(id))).filter(Boolean);
      col.movies = [...col.movies, ...customAdded];
      
      // Apply manual movie removals
      if (mods.removedMovies[col.id]) {
        col.movies = col.movies.filter(m => !mods.removedMovies[col.id].includes(String(m.id)));
      }
      
`;
code = code.replace(filterRegex, newFilter);

// Add dependencies to useMemo
code = code.replace(/\}, \[jellyfinMovies\]\);/, `}, [jellyfinMovies, collectionMods]);`);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched App.tsx with collectionMods");
