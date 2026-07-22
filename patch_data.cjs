const fs = require('fs');
let code = fs.readFileSync('src/data.ts', 'utf-8');

const regex = /providerIds\?: Record<string, string>;/m;

code = code.replace(regex, `providerIds?: Record<string, string>;
  isTv?: boolean;
  seasons?: { season_number: number, name: string, episode_count: number, posterUrl?: string }[];`);

fs.writeFileSync('src/data.ts', code, 'utf-8');
console.log("Patched data.ts.");
