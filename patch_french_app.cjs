const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/Erreur lors du test:/g, 'Error during test:');
code = code.replace(/Erreur réseau lors du test/g, 'Network error during test');
code = code.replace(/Voulez-vous déconnecter ce serveur de CLASSICO \?/g, 'Do you want to disconnect this server from CLASSICO?');
code = code.replace(/Rechercher des/gi, 'Search for');

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched French");
