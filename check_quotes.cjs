const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');
const appStart = content.indexOf('export default function App() {');

let doubleQuote = false;
let singleQuote = false;
let backtick = false;

for (let i = 0; i < appStart; i++) {
  if (content[i] === '"' && content[i-1] !== '\\') doubleQuote = !doubleQuote;
  if (content[i] === "'" && content[i-1] !== '\\') singleQuote = !singleQuote;
  if (content[i] === '`' && content[i-1] !== '\\') backtick = !backtick;
}

console.log(`Before App: Double=${doubleQuote} Single=${singleQuote} Backtick=${backtick}`);
