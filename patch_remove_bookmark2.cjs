const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf-8');
  
  // Define the exact regex to find and remove the button in MovieModal
  const btnPattern = /<button[\s\S]*?onClick=\{onToggleBookmark\}[\s\S]*?<\/button>/g;
  code = code.replace(btnPattern, '');
  
  fs.writeFileSync(file, code, 'utf-8');
}

patchFile('src/components/MovieModal.tsx');
console.log("Removed bookmarks from MovieModal");
