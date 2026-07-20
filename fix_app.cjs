const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// I will just use regex to remove the garbage that was duplicated.
// The garbage is `onLeft, ChevronRight, ... ` down to `import HeroSkeleton from "./components/HeroSkeleton";`
// Wait, the actual imports are at the VERY BEGINNING of the file!
// If they are duplicated in the middle of the file, we can just remove them.

const match = content.match(/onLeft, ChevronRight,[\s\S]*?import HeroSkeleton from "\.\/components\/HeroSkeleton";/);
if (match) {
    content = content.replace(match[0], "");
    fs.writeFileSync('src/App.tsx', content);
    console.log("Patched successfully.");
} else {
    console.log("Could not find the exact chunk to remove.");
}

