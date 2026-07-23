const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// I'll just remove the whole <div className="absolute top-4 right-4 z-50 flex items-center gap-2"> that contains the pin prompt and admin button.
// Actually, it's easier to regex replace everything from {showPinPrompt ? to </button>}
// But let's just find `setIsAdminUnlocked(false);`
code = code.replace(/<button\s*onClick=\{\(\) => \{\s*if \(false\) \{\s*setIsAdminUnlocked\(false\);\s*\} else \{\s*setShowPinPrompt\(true\);\s*setPinInput\(""\);\s*\}\s*\}\}\s*title="Admin"\s*>\s*<Key className="w-4 h-4" \/>\s*<\/button>/g, '');

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Fixed button");
