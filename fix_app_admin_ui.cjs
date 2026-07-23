const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/<button\n\s*onClick=\{\(\) => \{\n\s*if \(isAdminUnlocked\) \{\n\s*setIsAdminUnlocked\(false\);\n\s*\} else \{\n\s*setShowPinPrompt\(true\);\n\s*\}\n\s*\}\}\n\s*className=\{`transition-opacity duration-500 hover:opacity-100 \$\{isAdminUnlocked \? "text-\[#D4AF37\] opacity-80" : "text-zinc-600 opacity-40 hover:text-white hover:opacity-100"\}`\}\n\s*title="Admin"\n\s*>\n\s*<Key className="w-4 h-4" \/>\n\s*<\/button>/g, '');

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Admin Key button removed from App");
