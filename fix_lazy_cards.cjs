const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /<LazyVirtualCard key={`\${movie.id}-search-\${idx}`}/g,
  '<LazyVirtualCard key={`${movie.id}-search-${idx}`} priority={idx < 10}>'
);

code = code.replace(
  /<LazyVirtualCard key={`resume-\${movie.id}-\${idx}`}/g,
  '<LazyVirtualCard key={`resume-${movie.id}-${idx}`} priority={idx < 6}>'
);

code = code.replace(
  /<LazyVirtualCard \n                              key={`\${collection.id}-\${movie.id}`}/g,
  '<LazyVirtualCard \n                              key={`${collection.id}-${movie.id}`}\n                              priority={idx < 6}'
);

code = code.replace(
  /<LazyVirtualCard key={`\${movie.id}-detail-\${idx}`}/g,
  '<LazyVirtualCard key={`${movie.id}-detail-${idx}`} priority={idx < 8}>'
);

code = code.replace(
  /<LazyVirtualCard key={`\${movie.id}-history-\${idx}`}/g,
  '<LazyVirtualCard key={`${movie.id}-history-${idx}`} priority={idx < 8}>'
);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Lazy cards updated");
