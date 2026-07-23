const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const replacements = {
  'Connexion refusée par le serveur': 'Connection refused by the server',
  'Vérifiez vos informations': 'Check your credentials',
  'Impossible de contacter le serveur à l\'adresse fournie': 'Unable to contact the server at the provided address',
  'Le serveur Jellyfin a renvoyé une réponse invalide': 'The Jellyfin server returned an invalid response',
  'Erreur bulk import': 'Bulk import error',
  'Erreur lors de la recherche TMDb': 'Error during TMDB search',
  'Erreur lors de la récupération des détails TMDb': 'Error fetching TMDB details',
  'Erreur test odyssey': 'Test odyssey error',
  'Erreur de vidage du cache des images': 'Error clearing image cache',
  'Serveur non configuré': 'Server not configured',
  "Erreur de chargement d'image": 'Error loading image',
  'Erreur:': 'Error:',
  'Contexte:': 'Context:',
  'Erreur proxy réseau': 'Network proxy error',
  'Code erreur Jellyfin': 'Jellyfin error code',
  "page d'erreur": 'error page'
};

for (const [fr, en] of Object.entries(replacements)) {
  code = code.split(fr).join(en);
}

fs.writeFileSync('server.ts', code, 'utf-8');
console.log("Patched French in server.ts");
