const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const target = `{history
                          .filter(id => getProgress(id) > 0 && getProgress(id) < 0.95)
                          .map(id => allMovies.find(m => m.id === id || m.id === id + "-tv" || m.id === id.replace("-tv", "")))
                          .filter((m): m is Movie => !!m)`;

const replacement = `{Array.from(new Set([...history, ...Object.keys(progressData).map(k => k.replace("-tv", ""))]))
                          .filter(id => getProgress(id) > 0 && getProgress(id) < 0.95)
                          .map(id => allMovies.find(m => m.id === id || m.id === id + "-tv" || m.id === id.replace("-tv", "")))
                          .filter((m, idx, self) => !!m && self.findIndex(t => t?.id === m?.id) === idx)`;

app = app.replace(target, replacement);
fs.writeFileSync('src/App.tsx', app);
console.log("Success");
