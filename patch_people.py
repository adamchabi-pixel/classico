import re

with open("server.ts", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("fields=Overview,Genres,People,CommunityRating,Taglines,ProductionYear,RunTimeTicks,Path,ProviderIds,OriginalTitle,Studios", "fields=Overview,Genres,CommunityRating,Taglines,ProductionYear,RunTimeTicks,Path,ProviderIds,OriginalTitle,Studios")

with open("server.ts", "w", encoding="utf-8") as f:
    f.write(content)
