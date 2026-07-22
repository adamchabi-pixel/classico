const fs = require('fs');
let code = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf-8');

// Update props interface
code = code.replace(
  /export interface MovieDetailViewProps \{/,
  `export interface MovieDetailViewProps {
  onSimilarClick?: (id: string) => void;`
);

// Destructure new prop
code = code.replace(
  /onPlay,\s*}: MovieDetailViewProps\) \{/,
  `onPlay,
  onSimilarClick,
}: MovieDetailViewProps) {`
);

// Update click handler for similar
code = code.replace(
  /onClick=\{\(\) => \{\s*window\.scrollTo\(0, 0\);\s*onPlay\(sim\.id\);\s*\}\}/g,
  `onClick={() => {
                  window.scrollTo(0, 0);
                  if (onSimilarClick) {
                    onSimilarClick(sim.id);
                  } else {
                    window.location.hash = "/movie/" + sim.id;
                  }
                }}`
);

fs.writeFileSync('src/components/MovieDetailView.tsx', code, 'utf-8');
console.log("Patched similar click!");
