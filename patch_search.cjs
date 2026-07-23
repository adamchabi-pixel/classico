const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add searchInput state
code = code.replace(/const \[searchQuery, setSearchQuery\] = useState\(""\);/, `const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");`);

// 2. Update search input bindings
code = code.replace(/value=\{searchQuery\}\n\s*onChange=\{\(e\) => setSearchQuery\(e\.target\.value\)\}/, `value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearchQuery(searchInput);
                  }
                }}`);

// 3. Update CLEAR button
code = code.replace(/onClick=\{\(\) => setSearchQuery\(""\)\}/g, `onClick={() => { setSearchQuery(""); setSearchInput(""); }}`);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched search logic in App.tsx");
