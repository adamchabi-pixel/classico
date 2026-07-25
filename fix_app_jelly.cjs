const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Remove jellyfin from App.tsx
content = content.replace(/import \{ heroMoviesData \} from "\.\/data\/hero_movies";/g, "");
content = content.replace(/const jellyfinHeroMovies = heroMoviesData\.heroes;/g, "const jellyfinHeroMovies: any[] = [];");

// Fix TS errors
content = content.replace(/const baseMovie = group\.find\(\(m: Movie\) => m\.isJellyfin \|\| m\.streamUrl\) \|\| group\[0\];/g, "let baseMovie = group[0];");

// Remove ts errors
content = content.replace(/m\.isJellyfin \|\| m\.streamUrl/g, "false");
content = content.replace(/providerIds:/g, "providerIds_unused:");

// movie.iframeSrc
content = content.replace(/const isIframe = movie\.isIframeEmbed \|\| \!\!movie\.iframeSrc;/g, "const isIframe = movie.isIframeEmbed || !!(movie as any).iframeSrc;");
content = content.replace(/src=\{movie\.iframeSrc\}/g, "src={(movie as any).iframeSrc}");

fs.writeFileSync('src/App.tsx', content);
console.log('done jelly');
