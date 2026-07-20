const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');
const appStart = content.indexOf('export default function App() {');

let curly = 0;
let paren = 0;

for (let i = appStart; i < content.length; i++) {
  if (content[i] === '{') curly++;
  if (content[i] === '}') curly--;
  if (content[i] === '(') paren++;
  if (content[i] === ')') paren--;
}

console.log(`Inside App: Curly=${curly} Paren=${paren}`);
