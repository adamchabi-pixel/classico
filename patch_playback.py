import re

with open("server.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the deviceProfile object with a more robust one
old_profile_start = '  const deviceProfile = {\n    DeviceProfile: {'
new_profile_start = '''  const pbBody = {
    UserId: userId,
    MaxStreamingBitrate: 15000000,
    IsPlayback: true,
    AutoOpenLiveStream: true,
    EnableDirectPlay: true,
    EnableDirectStream: true,
    EnableTranscoding: true,
    DeviceProfile: {'''

content = content.replace(old_profile_start, new_profile_start)
content = content.replace('body: JSON.stringify(deviceProfile)', 'body: JSON.stringify(pbBody)')

with open("server.ts", "w", encoding="utf-8") as f:
    f.write(content)

print("Patch done")
