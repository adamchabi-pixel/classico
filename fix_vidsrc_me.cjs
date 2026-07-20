const fs = require('fs');

function updateFile(file) {
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(/vidsrc\.sbs/g, 'vidsrc.me');
    fs.writeFileSync(file, code);
}

updateFile('src/components/CinemaPlayerView.tsx');
updateFile('server.ts');
