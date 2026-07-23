const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /<p className="text-xs text-zinc-500 font-mono italic">No recent watch history available\.<\/p>\s*<\/div>/,
  '<p className="text-xs text-zinc-500 font-mono italic">No recent watch history available.</p>\n                    )}\n                  </div>'
);

code = code.replace(
  /© \{new Date\(\)\.getFullYear\(\)\} CLASSICO Streaming Inc\. • All rights reserved\.\s*<\/p>\s*\)\}\s*<\/div>/,
  '© {new Date().getFullYear()} CLASSICO Streaming Inc. • All rights reserved.\n          </p>\n        </div>'
);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Fixed parens");
