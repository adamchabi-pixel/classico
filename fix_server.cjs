const fs = require("fs");
let content = fs.readFileSync("server.ts", "utf-8");

const startStr = "if (response.headers[\"content-length\"]) {";
const endStr = "response.pipe(res);";

const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr, startIdx) + endStr.length;

const replacement = `if (response.headers["content-length"]) {
      responseHeaders["Content-Length"] = response.headers["content-length"];
    }

    if (response.headers["connection"]) {
      responseHeaders["Connection"] = response.headers["connection"];
    }

    // Forward exact 206 status code for Range or 200/other
    res.writeHead(response.statusCode || 200, responseHeaders);
    res.flushHeaders();

    let totalBytesStreamed = 0;
    let lastLogTime = Date.now();
    let firstChunkReceived = false;

    response.on("data", (chunk) => {
      if (!firstChunkReceived) {
        firstChunkReceived = true;
        const ttfbFirstOctet = Date.now() - reqStartTimestamp;
        console.log(\`[PERF_MEASURE] [\${perfId}] FIRST_OCTET | T+\${ttfbFirstOctet}ms | Jellyfin started sending data. Chunk size: \${chunk.length}\`);
      }
      totalBytesStreamed += chunk.length;
      const now = Date.now();
      if (now - lastLogTime > 4000) {
        lastLogTime = now;
      }
    });

    response.on("end", () => {
      const timeTotal = Date.now() - reqStartTimestamp;
      console.log(\`[PERF_MEASURE] [\${perfId}] END | T+\${timeTotal}ms | Finished sending stream to browser.\`);
    });

    response.on("error", (err) => {
      console.error(\`[PERF_MEASURE] [\${perfId}] ERROR |\`, err);
    });

    response.pipe(res);`;

content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
fs.writeFileSync("server.ts", content);
