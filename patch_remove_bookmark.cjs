const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf-8');
  code = code.replace(/isBookmarked,/g, '');
  code = code.replace(/onToggleBookmark,/g, '');
  
  // Remove button block
  const btnStartStr = '<button\\s+onClick=\\{onToggleBookmark\\}[\\s\\S]*?<\\/button>';
  code = code.replace(new RegExp(btnStartStr, 'g'), '');
  
  fs.writeFileSync(file, code, 'utf-8');
}

patchFile('src/components/MovieDetailView.tsx');
patchFile('src/components/MovieModal.tsx');

console.log("Removed bookmarks");
