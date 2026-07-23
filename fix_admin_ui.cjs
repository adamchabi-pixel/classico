const fs = require('fs');
let code = fs.readFileSync('src/components/AdminWishlist.tsx', 'utf-8');

code = code.replace(
  /<h3 className="text-md font-bold uppercase tracking-wider text-white border-b border-zinc-800 pb-2">\n\s*Ajouter un film par ID \(TMDb\)\n\s*<\/h3>/,
  `<div className="flex justify-between items-center border-b border-zinc-800 pb-2">
          <h3 className="text-md font-bold uppercase tracking-wider text-white">
            Ajouter un film par ID (TMDb)
          </h3>
          <button
            type="button"
            onClick={async () => {
              try {
                const res = await fetch("/api/admin/save-to-code", { method: "POST" });
                const data = await res.json();
                if (data.success) {
                  alert("Films sauvegardés de façon permanente pour le déploiement !");
                } else {
                  alert("Erreur lors de la sauvegarde : " + data.error);
                }
              } catch (e) {
                alert("Erreur réseau");
              }
            }}
            className="px-4 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/50 hover:bg-amber-500 hover:text-stone-950 text-xs font-bold uppercase tracking-widest rounded transition-colors"
          >
            Sauvegarder pour le Déploiement
          </button>
        </div>`
);

fs.writeFileSync('src/components/AdminWishlist.tsx', code, 'utf-8');
console.log("Added button");
