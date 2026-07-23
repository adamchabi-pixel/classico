const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/const \[tmdbCache, setTmdbCache\] = useState<any\[\]>\(\[\]\);\n/g, '');
code = code.replace(/const setUseTextTitleForJellyfinHero = \(\) => \{\};/g, 'const setUseTextTitleForJellyfinHero = (val: boolean) => {};');

const moreStates = `
  const [expandedCollections, setExpandedCollections] = useState<Record<string, boolean>>({});
  const isHeroLoading = false;
`;

code = code.replace(/const \[currentHeroIndex, setCurrentHeroIndex\] = useState\(0\);/, moreStates + '\n  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);');

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Fixed more states");
