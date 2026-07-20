const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf-8');

let curly = 0;
let paren = 0;

for (let i = 0; i < content.length; i++) {
    if (content[i] === '{') curly++;
    if (content[i] === '}') curly--;
    if (content[i] === '(') paren++;
    if (content[i] === ')') paren--;
}

console.log(`Curly: ${curly}, Paren: ${paren}`);
