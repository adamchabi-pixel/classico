import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update dynamicDirectorCollections title assignment
pattern_title = re.compile(r'dynamicDirectorCollections\.push\(\{\s*id: `director-\$\{slug\}`,\s*title: directorName,')
new_title = """        let displayTitle = directorName;
        if (directorName.toLowerCase() === "chad stahelski") displayTitle = "John Wick";
        if (directorName.toLowerCase() === "brett ratner") displayTitle = "Rush Hour";
        
        dynamicDirectorCollections.push({
          id: `director-${slug}`,
          title: displayTitle,"""
content = pattern_title.sub(new_title, content)


# 2. Update COLLECTION_BANNERS
pattern_banners = re.compile(r'const COLLECTION_BANNERS: Record<string, string> = \{[\s\S]*?\};')

new_banners = """const COLLECTION_BANNERS: Record<string, {url: string, style?: React.CSSProperties}> = {
  "john-wick": { url: "https://cdn.prod.website-files.com/652e1d0f532c272ff40207d0/654a348668add8c89454af34_Chad%20Stahelski.jpg" },
  "director-chad-stahelski": { url: "https://cdn.prod.website-files.com/652e1d0f532c272ff40207d0/654a348668add8c89454af34_Chad%20Stahelski.jpg" },
  "indiana-jones": { url: "https://cdn.artphotolimited.com/images/5b9fc1ecac06024957be8806/1000x1000/harrison-ford-en-1993.jpg" },
  "christopher-nolan": { url: "https://static.time.com/v3/assets/bltea6093859af6183b/blt1ea6b6a2f1266e7f/698a443b86f68e461e6f32b9/christopher-nolan-01.jpg?branch=production&width=3840&quality=75&auto=webp&crop=3:2" },
  "director-christopher-nolan": { url: "https://static.time.com/v3/assets/bltea6093859af6183b/blt1ea6b6a2f1266e7f/698a443b86f68e461e6f32b9/christopher-nolan-01.jpg?branch=production&width=3840&quality=75&auto=webp&crop=3:2" },
  "tarantino-collection": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDZe6FkKBAg8o5bmQjh2R131IigXlgx7BuWIEBRHviZg&s=10", style: { backgroundPosition: "center 20%" } },
  "director-quentin-tarantino": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDZe6FkKBAg8o5bmQjh2R131IigXlgx7BuWIEBRHviZg&s=10", style: { backgroundPosition: "center 20%" } },
  "star-wars": { url: "https://i.pinimg.com/564x/02/47/3b/02473babb95b7c65b57988a18eaa4357.jpg" },
  "james-bond": { url: "https://i.pinimg.com/236x/96/19/44/961944b5871a75672192deddd25fe830.jpg", style: { backgroundSize: "auto 90%", backgroundPosition: "right 20%" } },
  "rocky": { url: "https://preview.redd.it/my-first-attempt-at-rocky-balboa-might-edit-and-try-to-make-v0-5bykoynyb39b1.jpg?width=640&crop=smart&auto=webp&s=35b2c22ad2399c920878b54ded38a45b1502198d" },
  "terminator": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKBqbea29sYZRGpKMKWWQuHIoFddVvc2Pc3T99QbeC8AtAdfSF3IgU4jB5&s=10" },
  "director-frank-darabont": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYkJ9a3HkUEPf9YprNRzIerQpqWEVCVuse1U_VDAVQhaTt1G74tCKxNQWj&s=10" },
  "fast-and-furious": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXrgAjZyB1A4tvs4McappxohGUnoaI7KI_CWGJV98pi5n-mw_Q8Ig8rBJT&s=10" },
  "director-brett-ratner": { url: "https://image.tmdb.org/t/p/w500/nraZoTzwJQPHspAVsKfgl3RXKKa.jpg" },
  "batman": { url: "https://w0.peakpx.com/wallpaper/921/848/HD-wallpaper-christian-bale-batman-cool-movie-actor.jpg" },
  "franchise-batman": { url: "https://w0.peakpx.com/wallpaper/921/848/HD-wallpaper-christian-bale-batman-cool-movie-actor.jpg" },
  "mafia-movies": { url: "https://cdn.artphotolimited.com/images/60913d60bd40b85323893a87/1000x1000/al-pacino-super-star.jpg", style: { backgroundSize: "auto 90%", backgroundPosition: "right top" } },
  "mind-bending-mysteries": { url: "https://images.mubicdn.net/images/cast_member/3071/cache-3195-1568084972/image-w856.jpg" },
  "matrix": { url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDZe6FkKBAg8o5bmQjh2R131IigXlgx7BuWIEBRHviZg&s=10" }
};"""
content = pattern_banners.sub(new_banners, content)

# 3. Update generic renderer
pattern_render = re.compile(r'backgroundImage: `url\(\'\$\{COLLECTION_BANNERS\[c\.id\]\}\'\)`')
new_render = "backgroundImage: `url('${COLLECTION_BANNERS[c.id].url}')`,\n                            ...(COLLECTION_BANNERS[c.id].style || {})"
content = pattern_render.sub(new_render, content)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Patched successfully.")
