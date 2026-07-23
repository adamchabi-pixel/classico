const fs = require('fs');

function replaceFile(path, from, to) {
    if(!fs.existsSync(path)) return;
    let code = fs.readFileSync(path, 'utf-8');
    code = code.replace(from, to);
    fs.writeFileSync(path, code, 'utf-8');
}

let appCode = fs.readFileSync('src/App.tsx', 'utf-8');

appCode = appCode.replace(/>Mon Profil</g, '>My Profile<');
appCode = appCode.replace(/placeholder="Rechercher /gi, 'placeholder="Search ');

fs.writeFileSync('src/App.tsx', appCode, 'utf-8');

replaceFile('src/components/AdminWishlist.tsx', /Rechercher par nom/g, 'Search by name');

let serverCode = fs.readFileSync('server.ts', 'utf-8');
serverCode = serverCode.replace(/Inconnu/g, 'Unknown');
fs.writeFileSync('server.ts', serverCode, 'utf-8');

console.log("Patched French");
