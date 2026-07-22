const fs = require('fs');
let code = fs.readFileSync('src/components/AdminWishlist.tsx', 'utf-8');

const newStates = `  const [modCollection, setModCollection] = useState("none");
  const [modMovieId, setModMovieId] = useState("");`;

code = code.replace('  const [isAdding, setIsAdding] = useState(false);', '  const [isAdding, setIsAdding] = useState(false);\n' + newStates);

const handleMod = `  const handleCollectionMod = async (action: string) => {
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

code = code.replace('  const handleApprove = async (movie: any) => {', handleMod + '\n\n  const handleApprove = async (movie: any) => {');

const modForm = `      <div className="bg-zinc-900/60 p-6 rounded-xl border border-zinc-800 space-y-4">
        <h3 className="text-md font-bold uppercase tracking-wider text-white border-b border-zinc-800 pb-2 flex items-center gap-2">
          Gestion des Collections
        </h3>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 space-y-1 w-full">
            <label className="text-xs text-zinc-400">Collection Cible</label>
            <select 
              value={modCollection}
              onChange={e => setModCollection(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="none">Sélectionner...</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 space-y-1 w-full">
            <label className="text-xs text-zinc-400">ID Film (TMDb / IMDb)</label>
            <input 
              type="text" 
              value={modMovieId}
              onChange={e => setModMovieId(e.target.value)}
              placeholder="Ex: 278"
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 pt-2">
          <button 
            onClick={() => handleCollectionMod("add_movie")}
            disabled={modCollection === "none" || !modMovieId.trim()}
            className="flex-1 bg-zinc-800 text-white text-xs px-3 py-2 rounded hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            Ajouter le Film
          </button>
          <button 
            onClick={() => handleCollectionMod("remove_movie")}
            disabled={modCollection === "none" || !modMovieId.trim()}
            className="flex-1 bg-zinc-800 text-white text-xs px-3 py-2 rounded hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            Retirer le Film
          </button>
          <button 
            onClick={() => {
              if (confirm("Supprimer cette collection de l'affichage ?")) {
                handleCollectionMod("delete_collection");
              }
            }}
            disabled={modCollection === "none"}
            className="flex-1 bg-rose-900/30 text-rose-500 border border-rose-900/50 text-xs px-3 py-2 rounded hover:bg-rose-900/50 disabled:opacity-50 transition-colors"
          >
            Supprimer la Collection
          </button>
        </div>
      </div>`;

code = code.replace(/<\/form>\n\s*<\/div>/, `</form>\n      </div>\n${modForm}`);

fs.writeFileSync('src/components/AdminWishlist.tsx', code, 'utf-8');
console.log("Patched AdminWishlist with mod controls");
