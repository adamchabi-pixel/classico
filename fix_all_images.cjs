const fs = require('fs');
let modal = fs.readFileSync('src/components/MovieModal.tsx', 'utf-8');
modal = modal.replace(/<img/g, '<img referrerPolicy="no-referrer"');
modal = modal.replace(/<motion\.img/g, '<motion.img referrerPolicy="no-referrer"');
fs.writeFileSync('src/components/MovieModal.tsx', modal, 'utf-8');

let admin = fs.readFileSync('src/components/AdminWishlist.tsx', 'utf-8');
admin = admin.replace(/<img/g, '<img referrerPolicy="no-referrer"');
fs.writeFileSync('src/components/AdminWishlist.tsx', admin, 'utf-8');
console.log("Images referrer fixed");
