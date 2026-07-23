const fs = require('fs');

const head = fs.readFileSync('server.ts', 'utf-8').split('\n').slice(0, 198).join('\n');
const keep1 = fs.readFileSync('keep_endpoints_1.ts', 'utf-8');
const keep2 = fs.readFileSync('keep_endpoints_2.ts', 'utf-8');
const keep3 = fs.readFileSync('keep_endpoints_3.ts', 'utf-8');

const tail = `
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    // Create Vite server on top of Express and bind to HTTP server to handle HMR WebSocket upgrade
    const vite = await createViteServer({
      server: { 
        middlewareMode: true
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    const assetsPath = path.join(distPath, 'assets');
    
    app.use('/assets', express.static(assetsPath, {
      maxAge: '1y',
      immutable: true,
      setHeaders: (res, p) => {
        if (p.endsWith('.js') || p.endsWith('.css') || p.endsWith('.woff2') || p.endsWith('.png') || p.endsWith('.jpg')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      }
    }));
    
    app.use(express.static(distPath, {
      setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      }
    }));
    
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on port " + PORT);
  });
`;

// Remove jellyfinOrigin logic from head
let cleanHead = head.replace(/const config = getJellyfinConfig\(\);\s*let jellyfinOrigin = "";\s*if \(config && config\.url\) \{[\s\S]*?\}\s*\}/g, 'let jellyfinOrigin = "";');
cleanHead = cleanHead.replace(/if \(jellyfinOrigin\) \{[\s\S]*?\}/g, '');

const finalFile = cleanHead + '\n' + keep3 + '\n' + keep1 + '\n' + keep2 + '\n' + tail;
fs.writeFileSync('server.ts', finalFile, 'utf-8');
console.log("Generated clean server.ts");
