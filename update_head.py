import re

with open('index.html', 'r') as f:
    html = f.read()

head_additions = """
    <link rel="icon" type="image/x-icon" href="/favicon.ico?v=classico2" />
    <link rel="icon" type="image/png" href="/favicon.png?v=classico2" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=classico2" />
    <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png?v=classico2" />
    <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png?v=classico2" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180.png?v=classico2" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=classico2" />
    <link rel="manifest" href="/manifest.json?v=classico2" />
"""

# Remove old icon links
html = re.sub(r'<link rel="icon"[^>]*>\n?', '', html)
html = re.sub(r'<link rel="apple-touch-icon"[^>]*>\n?', '', html)
html = re.sub(r'<link rel="apple-touch-icon-precomposed"[^>]*>\n?', '', html)
html = re.sub(r'<link rel="manifest"[^>]*>\n?', '', html)

# Insert new ones before <meta name="viewport"
html = html.replace('<meta name="viewport"', head_additions.strip() + '\n    <meta name="viewport"')

with open('index.html', 'w') as f:
    f.write(html)
