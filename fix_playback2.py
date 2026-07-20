import re

with open('server.ts', 'r') as f:
    content = f.read()

# Replace the whole getPlaybackData function (including the mangled part)
content = re.sub(
    r'async function getPlaybackData\([\s\S]*?\}',
    '''async function getPlaybackData(id: string, forceTranscode?: boolean, lowQuality?: boolean, forceJellyfin?: boolean) {
  const iframeResult = {
    id: id,
    streamUrl: `https://player.videasy.net/movie/${id}?color=FFD700&overlay=true`,
    duration: 0,
    container: "iframe",
    title: "Film (Embed)",
    isDirect: true,
    isIframeEmbed: true,
    iframeSrc: `https://player.videasy.net/movie/${id}?color=FFD700&overlay=true`,
    subtitles: [],
    audios: []
  };
  return iframeResult;
}''', content)

with open('server.ts', 'w') as f:
    f.write(content)
