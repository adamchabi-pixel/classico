const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// replace the search logic to query 2 pages
const searchBlock = `
    const searchUrl1 = \`https://api.themoviedb.org/3/search/multi?query=\${encodeURIComponent(query)}&language=en-US&page=1\`;
    const searchUrl2 = \`https://api.themoviedb.org/3/search/multi?query=\${encodeURIComponent(query)}&language=en-US&page=2\`;
    const [searchRes1, searchRes2] = await Promise.all([
      fetch(searchUrl1, { headers: { "Authorization": \`Bearer \${TMDB_ACCESS_TOKEN}\`, "Accept": "application/json" } }),
      fetch(searchUrl2, { headers: { "Authorization": \`Bearer \${TMDB_ACCESS_TOKEN}\`, "Accept": "application/json" } })
    ]);
    
    if (!searchRes1.ok) throw new Error("TMDB search failed");
    const searchData1 = await searchRes1.json();
    const searchData2 = searchRes2.ok ? await searchRes2.json() : { results: [] };
    
    const combinedResults = [...(searchData1.results || []), ...(searchData2.results || [])];
    const validResults = combinedResults.filter((m: any) => m.media_type === "movie" || m.media_type === "tv");
`;

code = code.replace(/const searchUrl = [\s\S]*?const validResults = searchData\.results\.filter\(\(m: any\) => m\.media_type === "movie" \|\| m\.media_type === "tv"\);/, searchBlock);

fs.writeFileSync('server.ts', code, 'utf-8');
console.log("Updated server.ts with 2 pages search");
