const fs = require('fs');
let code = fs.readFileSync('src/components/MovieDetailView.tsx', 'utf-8');

// The original placement:
const isTvBlockRegex = /\{movie\.isTv \? \([\s\S]*?<div className="flex gap-4 border-b border-zinc-800 pb-2 overflow-x-auto no-scrollbar">[\s\S]*?<\/div>[\s\S]*?\) : \(/m;
const match = code.match(isTvBlockRegex);
if(match) console.log("Found isTv block!");
else console.log("Not found isTv block");
