const fs = require('fs');
let modalContent = fs.readFileSync('src/components/MovieModal.tsx', 'utf8');
modalContent = modalContent.replace(/if \(onSimilarClick\) \{ if \(onSimilarClick\) onSimilarClick\(sim\.id\); \} else \{ window\.location\.href = "\/movie\/" \+ sim\.id; \}/g, "if (onSimilarClick) { onSimilarClick(sim.id); }");
fs.writeFileSync('src/components/MovieModal.tsx', modalContent);

console.log('done lint 3');
