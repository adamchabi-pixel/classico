const fs = require('fs');

let detailView = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf-8');
detailView = detailView.replace(/<img src=\{poster\} /g, '<img src={poster} referrerPolicy="no-referrer" ');
detailView = detailView.replace(/<img src=\{ep.stillUrl\} /g, '<img src={ep.stillUrl} referrerPolicy="no-referrer" ');
detailView = detailView.replace(/<img src=\{actor.imageUrl\} /g, '<img src={actor.imageUrl} referrerPolicy="no-referrer" ');
detailView = detailView.replace(/<img src=\{sim.posterUrl\} /g, '<img src={sim.posterUrl} referrerPolicy="no-referrer" ');
detailView = detailView.replace(/<img src=\{fullMovie.logoUrl\} /g, '<img src={fullMovie.logoUrl} referrerPolicy="no-referrer" ');

fs.writeFileSync('src/components/MovieDetailView.tsx', detailView, 'utf-8');

let serverCode = fs.readFileSync('server.ts', 'utf-8');

// Change process.cwd() to os.tmpdir() for caches in production
serverCode = serverCode.replace(/process\.cwd\(\)/g, '((process.env.NODE_ENV === "production") ? require("os").tmpdir() : process.cwd())');

fs.writeFileSync('server.ts', serverCode, 'utf-8');
console.log("Posters and server temp dir fixed");
