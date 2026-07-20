with open('server.ts', 'r') as f:
    lines = f.readlines()

new_lines = lines[:1143] + [
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
}
'''
] + lines[1776:]

with open('server.ts', 'w') as f:
    f.writelines(new_lines)
