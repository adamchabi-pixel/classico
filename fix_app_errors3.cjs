const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/const \[showPinPrompt, setShowPinPrompt\] = useState\(false\);\n\s*const \[pinInput, setPinInput\] = useState\(""\);\n/g, '');
code = code.replace(/\{showPinPrompt \? \([\s\S]*?\) : \(/g, '');
code = code.replace(/<Key className="w-4 h-4" \/>\s*<\/button>\s*\)/g, '<Key className="w-4 h-4" /></button>'); // wait, we already removed the button.

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Fixed pin prompt state");
