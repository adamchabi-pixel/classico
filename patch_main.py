import re

with open("src/main.tsx", "r") as f:
    content = f.read()

target = """          director: item.People?.find((p: any) => p.Type === "Director")?.Name || "Réalisateur Inconnu",
          cast: item.People?.filter((p: any) => p.Type === "Actor").slice(0, 4).map((p: any) => p.Name) || [],"""
replacement = """          director: item.People?.find((p: any) => p.Type === "Director")?.Name || "Réalisateur Inconnu",
          cast: item.People?.filter((p: any) => p.Type === "Actor").slice(0, 4).map((p: any) => p.Name) || [],
          castDetails: item.People?.filter((p: any) => p.Type === "Actor").slice(0, 8).map((p: any) => ({
            id: p.Id,
            name: p.Name,
            role: p.Role || "",
            imageUrl: p.PrimaryImageTag ? `${serverUrl}/Items/${p.Id}/Images/Primary?tag=${p.PrimaryImageTag}&quality=90&fillWidth=300&fillHeight=450` : undefined
          })) || [],"""

if target in content:
    content = content.replace(target, replacement)
    print("Patched main.tsx")
else:
    print("Could not patch main.tsx")

with open("src/main.tsx", "w") as f:
    f.write(content)
