const fs = require('fs');
let content = fs.readFileSync('src/components/MovieCard.tsx', 'utf8');

const target = `{/* Persistent Gradient overlay for text legibility */}`;
const replacement = `{/* Shine effect */}
          <div className="absolute inset-0 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          
          {/* Persistent Gradient overlay for text legibility */}`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/MovieCard.tsx', content);
console.log('done shine');
