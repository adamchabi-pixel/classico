const fs = require('fs');

const file = 'src/components/AdminWishlist.tsx';
let code = fs.readFileSync(file, 'utf-8');

// Update props
code = code.replace(
  'export function AdminWishlist({ onAdded, categories = [] }: { onAdded?: () => void, categories?: string[] }) {',
  'export function AdminWishlist({ onAdded, categories = [], allMovies = [] }: { onAdded?: () => void, categories?: string[], allMovies?: any[] }) {'
);

// Replace the ID input with a Title input
code = code.replace(
  `          <div className="flex-1 space-y-1 w-full">
            <label className="text-xs text-zinc-400">ID Film (TMDb / IMDb)</label>
            <input 
              type="text" 
              value={modMovieId}
              onChange={e => setModMovieId(e.target.value)}
              placeholder="Ex: 278"
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>`,
  `          <div className="flex-1 space-y-1 w-full">
            <label className="text-xs text-zinc-400">Nom du Film</label>
            <input 
              type="text" 
              value={modMovieId}
              onChange={e => setModMovieId(e.target.value)}
              placeholder="Rechercher par nom..."
              list="admin-movie-list"
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
            />
            <datalist id="admin-movie-list">
              {allMovies.map(m => (
                <option key={m.id} value={m.title} />
              ))}
            </datalist>
          </div>`
);

// Update handleCollectionMod to resolve title -> ID
const oldHandleCollectionMod = `  const handleCollectionMod = async (action: "add_movie" | "remove_movie" | "delete_collection") => {
    if (action !== "delete_collection" && (!modCollection || modCollection === "none" || !modMovieId)) return;
    if (action === "delete_collection" && (!modCollection || modCollection === "none")) return;
    
    try {
      const res = await fetch("/api/admin/collections/modify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          collectionId: modCollection.toLowerCase().replace(/\\s+/g, '-'),
          movieId: modMovieId
        })
      });`;

const newHandleCollectionMod = `  const handleCollectionMod = async (action: "add_movie" | "remove_movie" | "delete_collection") => {
    if (action !== "delete_collection" && (!modCollection || modCollection === "none" || !modMovieId)) return;
    if (action === "delete_collection" && (!modCollection || modCollection === "none")) return;
    
    // Resolve movie title to ID if necessary
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
      });`;

code = code.replace(oldHandleCollectionMod, newHandleCollectionMod);

fs.writeFileSync(file, code, 'utf-8');
console.log("Patched AdminWishlist");
