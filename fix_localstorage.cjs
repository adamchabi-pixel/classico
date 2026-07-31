const fs = require('fs');

function fixFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let file = fs.readFileSync(filePath, 'utf8');

    // Remove all injected safeHelpers blocks completely
    file = file.replace(/const safeGetItem = \(key: string\) => \{ try \{ return safeGetItem\(key\); \} catch\(e\) \{ return null; \} \};\nconst safeSetItem = \(key: string, value: string\) => \{ try \{ safeSetItem\(key, value\); \} catch\(e\) \{\} \};\n/g, '');
    
    // Also without newline
    file = file.replace(/const safeGetItem = \(key: string\) => \{ try \{ return safeGetItem\(key\); \} catch\(e\) \{ return null; \} \};const safeSetItem = \(key: string, value: string\) => \{ try \{ safeSetItem\(key, value\); \} catch\(e\) \{\} \};/g, '');

    // Revert the replacements
    file = file.replace(/safeGetItem\(/g, 'localStorage.getItem(');
    file = file.replace(/safeSetItem\(/g, 'localStorage.setItem(');

    fs.writeFileSync(filePath, file);
}

['src/App.tsx', 'src/components/CinemaPlayerView.tsx', 'src/components/MovieDetailView.tsx', 'src/components/MovieCard.tsx', 'src/main.tsx'].forEach(fixFile);
