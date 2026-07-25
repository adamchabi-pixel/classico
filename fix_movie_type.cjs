const fs = require('fs');
let content = fs.readFileSync('src/data.ts', 'utf8');

if (!content.includes('isIframeEmbed?: boolean;')) {
    content = content.replace('export interface Movie {', 'export interface Movie {\n  isIframeEmbed?: boolean;\n  iframeSrc?: string;\n  isTv?: boolean;');
    fs.writeFileSync('src/data.ts', content);
}
console.log("fixed Movie type");
