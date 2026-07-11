with open('server.ts', 'r') as f:
    text = f.read()

import re

# Add TranscodingMaxAudioChannels to the urlObj block
pattern = re.compile(r'urlObj\.searchParams\.set\("VideoCodec", "h264"\);\s*urlObj\.searchParams\.set\("AudioCodec", "aac"\);', re.DOTALL)
replacement = """urlObj.searchParams.set("VideoCodec", "h264");
      urlObj.searchParams.set("AudioCodec", "aac");
      urlObj.searchParams.set("TranscodingMaxAudioChannels", "2");"""

text = pattern.sub(replacement, text)

with open('server.ts', 'w') as f:
    f.write(text)

