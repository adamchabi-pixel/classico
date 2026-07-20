const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');
const appStart = content.indexOf('export default function App() {');
if (appStart === -1) {
  console.log("App not found");
  process.exit(1);
}

let curly = 0;
let paren = 0;
let foundEnd = false;

for (let i = appStart; i < content.length; i++) {
  if (content[i] === '{') curly++;
  if (content[i] === '}') curly--;
  if (content[i] === '(') paren++;
  if (content[i] === ')') paren--;
}

console.log("Inside App: Curly=" + curly + " Paren=" + paren);

// We need exactly curly=0 and paren=0 at EOF.
// If it's > 0, we can just append the missing brackets.
let toAppend = '';
while (paren > 0) { toAppend += ')'; paren--; }
while (curly > 0) { toAppend += '}'; curly--; }

if (toAppend.length > 0) {
   fs.writeFileSync('src/App.tsx', content + toAppend);
   console.log("Appended " + toAppend);
}
