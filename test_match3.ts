const fs = require("fs");
const file = fs.readFileSync("src/App.tsx", "utf-8");
const matchFnString = file.match(/function cleanTitle[\s\S]*?function isMovieMatch[\s\S]*?\n\}/)[0];
console.log(matchFnString);
