const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /import React.*?Chevrif \('scrollRestoration' in history\) \{/s;
if (regex.test(content)) {
    console.log("Regex matched!");
} else {
    console.log("Regex did not match.");
}
