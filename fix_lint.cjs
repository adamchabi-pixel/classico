const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace the isLoading conditions that use jellyfinConfig
code = code.replace(/const isLoading =[\s\S]*?\(jellyfinConfig\.configured && isJellyfinHeroLoading && jellyfinHeroMovies\.length === 0\);/g, 'const isLoading = false;');

// Remove the isJellyfinLoading useEffect
code = code.replace(/useEffect\(\(\) => \{[\s\S]*?if \(!isJellyfinLoading\) \{[\s\S]*?\}[\s\S]*?\}, \[isJellyfinLoading\]\);/g, '');

// Empty loadJellyfinLibrary
code = code.replace(/const loadJellyfinLibrary = async \(\) => \{[\s\S]*?setJellyfinHeroMovies\(uniqueHeroes\);[\s\S]*?\} catch \(e\) \{[\s\S]*?\}[\s\S]*?\};/g, 'const loadJellyfinLibrary = async () => {};');
// Since it's nested or tricky, let's just wipe handles
code = code.replace(/const handleConnectJellyfin = async \(e: React\.FormEvent\) => \{[\s\S]*?localStorage\.setItem\("classico_jellyfin_apikey", jellyfinInputApiKey\);[\s\S]*?setIsJellyfinLoading\(true\);[\s\S]*?setJellyfinMovies\(libData\.movies\);[\s\S]*?setIsJellyfinLoading\(false\);[\s\S]*?\};/g, '');
code = code.replace(/const handleDisconnectJellyfin = async \(\) => \{[\s\S]*?setJellyfinConfig\(\{ configured: false, url: "" \}\);[\s\S]*?setJellyfinMovies\(\[\]\);[\s\S]*?setJellyfinInputUrl\(""\);[\s\S]*?setJellyfinInputApiKey\(""\);[\s\S]*?\};/g, '');

// Wipe checkJellyfinSetup
code = code.replace(/const checkJellyfinSetup = async \(\) => \{[\s\S]*?setJellyfinConfig\(\{ configured: true, url: "https:\/\/videasy.net" \}\);[\s\S]*?\};[\s\S]*?checkJellyfinSetup\(\);/g, '');

// Fix !isJellyfinLoading conditionals
code = code.replace(/\{!isJellyfinLoading && history\.some\(id => progressData\[id\] > 0 && progressData\[id\] < 0\.95\) && \(/g, '{history.some(id => progressData[id] > 0 && progressData[id] < 0.95) && (');
code = code.replace(/\{!isJellyfinLoading && \(/g, '{(');
code = code.replace(/jellyfinConfig\?\.configured && jellyfinHeroMovies\.length > 0 && jellyfinHeroMovie \? \(/g, 'jellyfinHeroMovies.length > 0 && jellyfinHeroMovie ? (');


fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Fixed more lint errors");
