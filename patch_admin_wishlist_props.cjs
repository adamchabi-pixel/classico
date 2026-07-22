const fs = require('fs');
let code = fs.readFileSync('src/components/AdminWishlist.tsx', 'utf-8');

code = code.replace(
  'export function AdminWishlist({ onAdded }: { onAdded?: () => void }) {',
  'export function AdminWishlist({ onAdded, categories = [] }: { onAdded?: () => void, categories?: string[] }) {'
);

fs.writeFileSync('src/components/AdminWishlist.tsx', code, 'utf-8');
console.log("Patched AdminWishlist props");
