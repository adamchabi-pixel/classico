const fs = require('fs');
let code = fs.readFileSync('src/components/MovieModal.tsx', 'utf-8');

code = code.replace(
  /onPlay: \(id: string\) => void;\s*\}/,
  'onPlay: (id: string) => void;\n  onSimilarClick?: (id: string) => void;\n}'
);

code = code.replace(
  /onPlay \}: MovieModalProps\) \{/,
  'onPlay, onSimilarClick }: MovieModalProps) {'
);

code = code.replace(
  /window\.location\.href = "\/movie\/" \+ sim\.id;/,
  'if (onSimilarClick) { onSimilarClick(sim.id); } else { window.location.href = "/movie/" + sim.id; }'
);

fs.writeFileSync('src/components/MovieModal.tsx', code, 'utf-8');
console.log("Patched props in MovieModal.tsx");
