import re

with open("index.html", "r") as f:
    content = f.read()

# Remove old icon links
content = re.sub(r'\s*<link rel="icon"[^>]*>', '', content)
content = re.sub(r'\s*<link rel="apple-touch-icon"[^>]*>', '', content)
# We leave manifest alone or remove? The user said "nettoie toutes les anciennes lignes de favoris et remplace-les par cette unique ligne" so we can probably leave manifest or remove it if it's considered a "favoris". Let's leave manifest or actually it points to manifest.json which might have old icons.

# Insert the new link after <meta charset="UTF-8" />
content = re.sub(r'(<meta charset="UTF-8" />)', r'\1\n    <link rel="icon" type="image/x-icon" href="/favicon.ico?v=99" />', content)

with open("index.html", "w") as f:
    f.write(content)
