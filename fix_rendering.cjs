const fs = require('fs');

let lazyCard = fs.readFileSync('src/components/LazyVirtualCard.tsx', 'utf-8');
lazyCard = lazyCard.replace(
  /entries\.forEach\(\(entry\) => \{[\s\S]*?callback\(entry\.isIntersecting\);[\s\S]*?\}\);[\s\S]*?\}\);/g,
  `entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const callback = callbacks.get(entry.target);
            if (callback) {
              callback(true);
              if (sharedObserver) sharedObserver.unobserve(entry.target);
            }
          }
        });`
);
lazyCard = lazyCard.replace(/rootMargin: "600px"/g, 'rootMargin: "800px"');
fs.writeFileSync('src/components/LazyVirtualCard.tsx', lazyCard, 'utf-8');

let movieCard = fs.readFileSync('src/components/MovieCard.tsx', 'utf-8');
movieCard = movieCard.replace(/\n\s*loading="lazy"/g, '');
movieCard = movieCard.replace(/\n\s*decoding="async"/g, '');
fs.writeFileSync('src/components/MovieCard.tsx', movieCard, 'utf-8');

console.log("Fixed rendering lag");
