const fs = require('fs');

const allMoviesFile = 'src/data/all_movies.ts';
let code = fs.readFileSync(allMoviesFile, 'utf-8');

const imported = JSON.parse(fs.readFileSync('imported_movies.json', 'utf-8'));

let arrayContentStr = code.match(/export const allMoviesData = \[([\s\S]*?)\];/)[1];

const newObjects = [];
for (const m of imported) {
  if (!code.includes(`"id": "${m.id}"`) && !code.includes(`id: "${m.id}"`)) {
    newObjects.push(JSON.stringify(m, null, 2));
  }
}

if (newObjects.length > 0) {
  let newArrayContent = arrayContentStr;
  if (!newArrayContent.trim().endsWith(',')) {
    newArrayContent += ',\n';
  }
  newArrayContent += newObjects.join(',\n') + '\n';
  
  code = code.replace(
    /export const allMoviesData = \[([\s\S]*?)\];/,
    `export const allMoviesData = [\n${newArrayContent}];`
  );
  
  fs.writeFileSync(allMoviesFile, code, 'utf-8');
  console.log("Migrated " + newObjects.length + " movies to all_movies.ts");
} else {
  console.log("No new movies to migrate");
}
