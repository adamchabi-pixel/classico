const fs = require('fs');

const file = 'src/components/AdminWishlist.tsx';
let code = fs.readFileSync(file, 'utf-8');

const oldFunc = `  const handleCollectionMod = async (action: string) => {
    if (action !== "delete_collection" && !modMovieId.trim()) {
      alert("Veuillez entrer un ID de film.");
      return;
    }
    try {
      const res = await fetch("/api/admin/collections/modify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, collectionId: modCollection, movieId: modMovieId })
      });
      const data = await res.json();
      if (data.success) {
        if (onAdded) onAdded();
        alert("Modification appliquée avec succès.");
      }
    } catch(err) {
      alert("Erreur réseau");
    }
  };`;

const newFunc = `  const handleCollectionMod = async (action: string) => {
    if (action !== "delete_collection" && (!modCollection || modCollection === "none" || !modMovieId)) return;
    if (action === "delete_collection" && (!modCollection || modCollection === "none")) return;
    
    let resolvedMovieId = modMovieId;
    if (action !== "delete_collection") {
      const matchedMovie = allMovies.find(m => m.title.toLowerCase() === modMovieId.trim().toLowerCase());
      if (matchedMovie) {
        resolvedMovieId = matchedMovie.id;
      }
    }

    try {
      const res = await fetch("/api/admin/collections/modify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          collectionId: modCollection.toLowerCase().replace(/\\s+/g, '-'),
          movieId: resolvedMovieId
        })
      });
      const data = await res.json();
      if (data.success) {
        if (onAdded) onAdded();
        alert("Modification appliquée avec succès.");
      }
    } catch(err) {
      alert("Erreur réseau");
    }
  };`;

code = code.replace(oldFunc, newFunc);
fs.writeFileSync(file, code, 'utf-8');
console.log("Patched AdminWishlist.tsx");
