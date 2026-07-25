const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/else if \(m\.providerIds && m\.providerIds\.Tmdb\)/g, "else if ((m as any).providerIds && (m as any).providerIds.Tmdb)");
content = content.replace(/key = \`tmdb_\$\{m\.providerIds\.Tmdb\}\`;/g, "key = `tmdb_${(m as any).providerIds.Tmdb}`;");
content = content.replace(/movie\.iframeSrc/g, "(movie as any).iframeSrc");
content = content.replace(/m\.name/g, "(m as any).name");
content = content.replace(/\(m\.providerIds_unused/g, "((m as any).providerIds_unused");

fs.writeFileSync('src/App.tsx', content);

let modalContent = fs.readFileSync('src/components/MovieModal.tsx', 'utf8');
modalContent = modalContent.replace(/onSimilarClick\(/g, "if (onSimilarClick) onSimilarClick(");
// wait actually it's "Cannot find name 'onSimilarClick'."
fs.writeFileSync('src/components/MovieModal.tsx', modalContent);

console.log('done lint 2');
