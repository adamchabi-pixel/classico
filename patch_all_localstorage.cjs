const fs = require('fs');

function patchFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let file = fs.readFileSync(filePath, 'utf8');
    
    // Add safe helpers at the top after imports
    const safeHelpers = `
const safeGetItem = (key: string) => { try { return localStorage.getItem(key); } catch(e) { return null; } };
const safeSetItem = (key: string, value: string) => { try { localStorage.setItem(key, value); } catch(e) {} };
`;

    // Only add if not already there
    if (!file.includes('const safeGetItem')) {
        file = file.replace(/import .* from .*;/g, (match) => match + '\n' + safeHelpers);
        // Fallback if no imports (like some scripts)
        if (!file.includes(safeHelpers)) {
           file = safeHelpers + '\n' + file;
        }
    }

    file = file.replace(/localStorage\.getItem\(/g, 'safeGetItem(');
    file = file.replace(/localStorage\.setItem\(/g, 'safeSetItem(');
    
    fs.writeFileSync(filePath, file);
}

patchFile('src/App.tsx');
patchFile('src/components/CinemaPlayerView.tsx');
patchFile('src/components/MovieDetailView.tsx');
patchFile('src/components/MovieCard.tsx');
patchFile('src/main.tsx');

