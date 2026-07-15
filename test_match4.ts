import fs from "fs";
const file = fs.readFileSync("src/App.tsx", "utf-8");
const matchRegex = /function cleanTitle\(([\s\S]*?)function isMovieMatch\([\s\S]*?\n\}/;
const m = file.match(matchRegex);
if(m) console.log(m[0]);
