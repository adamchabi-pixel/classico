const https = require('https');
https.get('https://jellyfin-jacklumber00.siren.mygiga.cloud/Items?searchTerm=odyssey&IncludeItemTypes=Movie&api_key=a2aac09e434e4bcc897c1b181ca197eb', res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(body);
      console.log("Found:", parsed.Items.length);
      if(parsed.Items.length > 0) {
        console.log(JSON.stringify(parsed.Items[0].ProviderIds, null, 2));
      }
    } catch(e) {}
  });
});
