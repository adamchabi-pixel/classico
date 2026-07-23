const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/<button[^>]*>\s*<Key className="w-4 h-4" \/>\s*<\/button>/g, '');
code = code.replace(/\{showPinPrompt && \([\s\S]*?\}\)/, '');

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Admin Key button and Pin prompt removed from App");
