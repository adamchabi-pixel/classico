import re

with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace('audios: []\n  };', 'audios: [],\n    videoCodec: "",\n    audioCodec: "",\n    chosenPath: ""\n  };')

with open('server.ts', 'w') as f:
    f.write(content)
