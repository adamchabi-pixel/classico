const fs = require('fs');

const file = 'src/components/AdminWishlist.tsx';
let code = fs.readFileSync(file, 'utf-8');

code = code.replace(
  'Ajouter un film par ID (TMDb / IMDb)',
  'Ajouter un film par ID (TMDb)'
);

code = code.replace(
  '<label className="text-xs text-zinc-400">ID TMDb ou IMDb</label>',
  '<label className="text-xs text-zinc-400">ID TMDb</label>'
);

code = code.replace(
  'placeholder="ex: tt0111161 ou 278"',
  'placeholder="ex: 278"'
);

fs.writeFileSync(file, code, 'utf-8');
console.log("Patched AdminWishlist 2");
