const fs = require('fs');
let code = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf-8');

// The arrow is at top-20 md:top-24
// The hero container is h-[65vh] md:h-[80vh] min-h-[500px] flex items-end
// Let's add pt-32 sm:pt-40 to the Hero Content Area so it doesn't overlap the top.
// Actually, it's flex items-end, so the content is at the BOTTOM of the hero.
// If it's at the bottom, how could it overlap the top navbar?
// Oh! Because the content might be taller than the hero! 
// "Game of thrones exemple ou lencadrer de la date et la duree du film sont cache par la navbar"
// If the content is taller than 65vh, `items-end` will push it up past the top of the container!
// To fix this, we should NOT use `items-end` with a fixed `h-[65vh]` if the content can overflow.
// Instead, we can use `pt-32` and `justify-end` with `min-h-[70vh]`.

code = code.replace(
  /h-\[65vh\] md:h-\[80vh\] min-h-\[500px\] \[\@media\(max-height:500px\)_and_\(orientation:landscape\)\]:min-h-0 \[\@media\(max-height:500px\)_and_\(orientation:landscape\)\]:h-\[100vh\] bg-black overflow-hidden flex items-end \[\@media\(max-height:500px\)_and_\(orientation:landscape\)\]:items-center \[\@media\(max-height:500px\)_and_\(orientation:landscape\)\]:pt-10/g,
  'min-h-[75vh] md:min-h-[85vh] [@media(max-height:500px)_and_(orientation:landscape)]:min-h-0 [@media(max-height:500px)_and_(orientation:landscape)]:h-[100vh] bg-black overflow-hidden flex flex-col justify-end pt-32 sm:pt-40 [@media(max-height:500px)_and_(orientation:landscape)]:justify-center [@media(max-height:500px)_and_(orientation:landscape)]:pt-10'
);

fs.writeFileSync('src/components/MovieDetailView.tsx', code, 'utf-8');
console.log("Patched layout again");
