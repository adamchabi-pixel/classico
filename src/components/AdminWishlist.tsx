import React, { useState, useEffect } from "react";
import { Check, Trash2, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function AdminWishlist({ onAdded, categories = [], allMovies = [] }: { onAdded?: () => void, categories?: string[], allMovies?: any[] }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [tmdbId, setTmdbId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("none");
  const [isHero, setIsHero] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [modCollection, setModCollection] = useState("none");
  const [modMovieId, setModMovieId] = useState("");

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    fetch("/api/wishlist")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRequests(data.requests);
        }
      })
      .catch(() => {});
  };

  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tmdbId.trim()) return;
    if (tmdbId.trim().toLowerCase().startsWith("tt")) {
      alert("Veuillez utiliser un ID TMDb uniquement (les IDs IMDb commençant par \"tt\" ne sont plus supportés).");
      return;
    }
    setIsAdding(true);
    try {
      const res = await fetch("/api/admin/movies/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: tmdbId, categoryId: selectedCategory, isHero })
      });
      const data = await res.json();
      if (data.success || data.added > 0) {
        setTmdbId("");
        setSelectedCategory("none");
        setIsHero(false);
        if (onAdded) {
          onAdded();
        } else {
          window.location.reload();
        }
      } else {
        alert("Erreur lors de l'ajout du film.");
      }
    } catch(err) {
      alert("Erreur réseau: " + err);
    }
    setIsAdding(false);
  };

  const handleCollectionMod = async (action: string) => {
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
  };

  const handleApprove = async (movie: any) => {
    try {
      const res = await fetch("/api/admin/movies/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: movie.id })
      });
      const data = await res.json();
      
      if (data.success || data.added > 0) {
        handleReject(movie.id); // Remove from wishlist
        if (onAdded) {
          onAdded();
        } else {
          window.location.reload();
        }
      } else {
        console.error("Erreur lors de l'ajout du film.");
      }
    } catch(err) {
      console.error("Erreur réseau: " + err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await fetch("/api/wishlist/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const newReq = requests.filter(r => r.id !== id);
      setRequests(newReq);
    } catch(err) {}
  };

  const emptyRequests = (
      <div className="py-12 bg-neutral-900/40 p-6 rounded-xl border border-dashed border-zinc-800 text-center space-y-3">
        <ShieldAlert className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
        <p className="text-sm text-zinc-400">Aucune demande en attente.</p>
      </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-zinc-900/60 p-6 rounded-xl border border-zinc-800 space-y-4">
        <h3 className="text-md font-bold uppercase tracking-wider text-white border-b border-zinc-800 pb-2">
          Ajouter un film par ID (TMDb)
        </h3>
        <form onSubmit={handleAddManual} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 space-y-1 w-full">
            <label className="text-xs text-zinc-400">ID TMDb</label>
            <input 
              type="text" 
              value={tmdbId}
              onChange={e => setTmdbId(e.target.value)}
              placeholder="ex: 278"
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
          <div className="flex-1 space-y-1 w-full">
            <label className="text-xs text-zinc-400">Ajouter à une catégorie</label>
            <select 
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="none">Aucune (None)</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center h-[42px] px-2 gap-2">
            <input 
              type="checkbox" 
              id="heroCheck"
              checked={isHero}
              onChange={e => setIsHero(e.target.checked)}
              className="w-4 h-4 accent-[#D4AF37]"
            />
            <label htmlFor="heroCheck" className="text-xs text-zinc-300 cursor-pointer">Add to Hero</label>
          </div>
          <button 
            type="submit" 
            disabled={isAdding || !tmdbId.trim()}
            className="bg-[#D4AF37] text-black font-bold px-6 py-2 h-[42px] rounded hover:bg-yellow-500 disabled:opacity-50 transition-colors"
          >
            {isAdding ? "Ajout..." : "Ajouter"}
          </button>
        </form>
      </div>
      <div className="bg-zinc-900/60 p-6 rounded-xl border border-zinc-800 space-y-4">
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
      </div>
      
      {requests.length === 0 ? emptyRequests : (
        <>
      <h3 className="text-lg font-display font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-zinc-800 pb-2">
        <ShieldAlert className="w-4 h-4 text-emerald-500" />
        Demandes Utilisateurs ({requests.length})
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <AnimatePresence>
          {requests.map(movie => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={movie.id} 
              className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden flex flex-col"
            >
              <div className="aspect-[2/3] w-full bg-zinc-800 relative">
                {movie.posterUrl ? (
                  <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs text-center p-2">Pas d'affiche</div>
                )}
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                <div>
                  <h4 className="text-white text-sm font-medium line-clamp-2">{movie.title}</h4>
                  <p className="text-zinc-500 text-[10px]">{movie.year}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleApprove(movie)}
                    className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-500 border border-emerald-500/30 rounded-lg py-1.5 flex justify-center items-center transition-colors"
                    title="Valider / Ajouter au site"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleReject(movie.id)}
                    className="flex-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-500 border border-rose-500/30 rounded-lg py-1.5 flex justify-center items-center transition-colors"
                    title="Supprimer / Refuser"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      </>)}
    </div>
  );
}
