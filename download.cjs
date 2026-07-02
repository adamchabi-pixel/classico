const fs = require('fs');
const https = require('https');

const url = "https://drive.google.com/uc?export=download&id=1Te3RGKhkKS66KsWMM9stTSfajZFdHi_6";
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
