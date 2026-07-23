const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf-8');

serverCode = serverCode.replace(/\(\(process\.env\.NODE_ENV === "production"\) \? require\("os"\)\.tmpdir\(\) : process\.cwd\(\)\)/g, 'process.cwd()');

// Selectively replace cache paths
serverCode = serverCode.replace(/path\.join\(process\.cwd\(\), "jellyfin-config\.json"\)/g, 'path.join((process.env.NODE_ENV === "production" ? require("os").tmpdir() : process.cwd()), "jellyfin-config.json")');
serverCode = serverCode.replace(/path\.join\(process\.cwd\(\), "wishlist_requests\.json"\)/g, 'path.join((process.env.NODE_ENV === "production" ? require("os").tmpdir() : process.cwd()), "wishlist_requests.json")');
serverCode = serverCode.replace(/path\.join\(process\.cwd\(\), "jellyfin-movies-cache\.json"\)/g, 'path.join((process.env.NODE_ENV === "production" ? require("os").tmpdir() : process.cwd()), "jellyfin-movies-cache.json")');
serverCode = serverCode.replace(/path\.join\(process\.cwd\(\), "jellyfin-hero-cache\.json"\)/g, 'path.join((process.env.NODE_ENV === "production" ? require("os").tmpdir() : process.cwd()), "jellyfin-hero-cache.json")');
serverCode = serverCode.replace(/path\.join\(process\.cwd\(\), "jellyfin-userid-cache\.json"\)/g, 'path.join((process.env.NODE_ENV === "production" ? require("os").tmpdir() : process.cwd()), "jellyfin-userid-cache.json")');
serverCode = serverCode.replace(/path\.join\(process\.cwd\(\), "\.data", "tmdb_cache\.json"\)/g, 'path.join((process.env.NODE_ENV === "production" ? require("os").tmpdir() : process.cwd()), "tmdb_cache.json")');
serverCode = serverCode.replace(/path\.join\(process\.cwd\(\), "collections_modifications\.json"\)/g, 'path.join((process.env.NODE_ENV === "production" ? require("os").tmpdir() : process.cwd()), "collections_modifications.json")');
serverCode = serverCode.replace(/path\.join\(process\.cwd\(\), "imported_movies\.json"\)/g, 'path.join((process.env.NODE_ENV === "production" ? require("os").tmpdir() : process.cwd()), "imported_movies.json")');

fs.writeFileSync('server.ts', serverCode, 'utf-8');
console.log("Server paths selectively fixed");
