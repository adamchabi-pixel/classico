const fs = require('fs');
let code = fs.readFileSync('src/components/AdminWishlist.tsx', 'utf-8');

code = code.replace(
  "collectionId: modCollection.toLowerCase().replace(/\\s+/g, '-'),",
  "collectionId: modCollection,"
);

fs.writeFileSync('src/components/AdminWishlist.tsx', code, 'utf-8');
console.log("Patched AdminWishlist");
