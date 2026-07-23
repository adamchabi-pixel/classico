const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/const \[isAdminUnlocked, setIsAdminUnlockedState\] = useState\(\(\) => localStorage\.getItem\("classico_admin_unlocked"\) === "true"\);\n\s*const setIsAdminUnlocked = \(val: boolean\) => \{\n\s*setIsAdminUnlockedState\(val\);\n\s*localStorage\.setItem\("classico_admin_unlocked", String\(val\)\);\n\s*\};\n/g, '');
code = code.replace(/const \[testOdysseySuccess, setTestOdysseySuccess\] = useState<string \| null>\(null\);\n/g, '');

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("State removed");
