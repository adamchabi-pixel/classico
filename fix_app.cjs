const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  `navigateTo("/player/" + movie.id);
    } else {
      navigateTo("/movie/" + movie.id);
    }`,
  `navigateTo("/player/" + pId);
    } else {
      navigateTo("/movie/" + movie.id);
    }`
);

fs.writeFileSync('src/App.tsx', content);
console.log("fixed App.tsx navigateTo");
