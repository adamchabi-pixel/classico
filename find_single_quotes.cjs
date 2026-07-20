const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');
const appStart = content.indexOf('export default function App() {');

let lines = content.slice(0, appStart).split('\n');
for (let i = 0; i < lines.length; i++) {
   const matches = lines[i].match(/'/g);
   if (matches && matches.length % 2 !== 0) {
      console.log(`Line ${i + 1}: ${lines[i]}`);
   }
}
