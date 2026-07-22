const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /<button\s+onClick=\{\(\) => \{\s*if\s*\(isAdminUnlocked\)\s*\{\s*setIsAdminUnlocked\(false\);\s*return;\s*\}\s*const\s*pin\s*=\s*prompt\([^)]+\);\s*if\s*\(pin\s*===\s*"0698"\)\s*\{\s*setIsAdminUnlocked\(true\);\s*\}\s*else\s*if\s*\(pin\)\s*\{\s*alert\("Code\s*incorrect\."\);\s*\}\s*\}\}[\s\S]*?<\/button>/;

const newButton = `
          {showPinPrompt ? (
            <div className="flex items-center gap-2">
              <input 
                type="password"
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                placeholder="PIN"
                className="bg-zinc-900 border border-zinc-700 text-white text-[10px] rounded px-2 py-1 w-16 focus:outline-none focus:border-[#D4AF37]"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (pinInput === "0698") {
                      setIsAdminUnlocked(true);
                      setShowPinPrompt(false);
                      setPinInput("");
                    } else {
                      alert("Code incorrect.");
                      setPinInput("");
                    }
                  }
                }}
              />
              <button onClick={() => setShowPinPrompt(false)} className="text-zinc-500 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                if (isAdminUnlocked) {
                  setIsAdminUnlocked(false);
                } else {
                  setShowPinPrompt(true);
                  setPinInput("");
                }
              }}
              className={\`transition-opacity duration-500 hover:opacity-100 \${isAdminUnlocked ? "text-[#D4AF37] opacity-80" : "text-zinc-600 opacity-40 hover:text-white hover:opacity-100"}\`}
              title="Admin"
            >
              <Key className="w-4 h-4" />
            </button>
          )}
`;

code = code.replace(regex, newButton);

const stateCode = `  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [isAdminUnlocked, setIsAdminUnlockedState]`;

code = code.replace('const [isAdminUnlocked, setIsAdminUnlockedState]', stateCode);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched");
