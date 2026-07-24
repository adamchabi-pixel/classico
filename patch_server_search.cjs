const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const regex = /const searchUrl1 = \`https:\/\/api\.themoviedb\.org\/3\/search\/multi\?query=\$\{encodeURIComponent\(query\)\}&language=en-US&page=1\`;\s*const searchUrl2 = \`https:\/\/api\.themoviedb\.org\/3\/search\/multi\?query=\$\{encodeURIComponent\(query\)\}&language=en-US&page=2\`;\s*const \[searchRes1, searchRes2\] = await Promise\.all\(\[\s*fetch\(searchUrl1, \{ headers: \{ "Authorization": \`Bearer \$\{TMDB_ACCESS_TOKEN\}\`, "Accept": "application\/json" \} \}\),\s*fetch\(searchUrl2, \{ headers: \{ "Authorization": \`Bearer \$\{TMDB_ACCESS_TOKEN\}\`, "Accept": "application\/json" \} \}\)\s*\]\);\s*if \(\!searchRes1\.ok\) throw new Error\("TMDB search failed"\);\s*const searchData1 = await searchRes1\.json\(\);\s*const searchData2 = searchRes2\.ok \? await searchRes2\.json\(\) : \{ results: \[\] \};\s*const combinedResults = \[\.\.\.\(searchData1\.results \|\| \[\]\), \.\.\.\(searchData2\.results \|\| \[\]\)\];/m;

const replacement = `const searchUrl1 = \`https://api.themoviedb.org/3/search/multi?query=\${encodeURIComponent(query)}&language=en-US&page=1\`;
    const searchRes1 = await fetch(searchUrl1, { headers: { "Authorization": \`Bearer \${TMDB_ACCESS_TOKEN}\`, "Accept": "application/json" } });
    if (!searchRes1.ok) throw new Error("TMDB search failed");
    const searchData1 = await searchRes1.json();
    const combinedResults = [...(searchData1.results || [])];`;

if (regex.test(code)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('server.ts', code, 'utf-8');
  console.log("Patched server.ts search to only fetch 1 page.");
} else {
  console.log("Regex not matched in server.ts");
}
