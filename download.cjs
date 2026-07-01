const fs = require('fs');
const https = require('https');

const url = "https://chatgpt.com/backend-api/estuary/content?id=file_00000000047071f5b399477705e0140b&ts=495258&p=fs&cid=1&sig=ec876aa38581f511f0228c1a581f4bd70dfd6d97c62d448969e5832ea3416d84&v=0";
const file = fs.createWriteStream("public/favicon.png");

https.get(url, function(response) {
  response.pipe(file);
  file.on('finish', function() {
    file.close();  
    console.log("Download completed.");
  });
}).on('error', function(err) { 
  fs.unlink("public/favicon.png");
  console.error("Error downloading file:", err.message);
});
