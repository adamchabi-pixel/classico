import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

new_banners = """// Hand-crafted high-fidelity collection backgrounds custom-generated
const COLLECTION_BANNERS: Record<string, string> = {
  "john-wick": "https://cdn.prod.website-files.com/652e1d0f532c272ff40207d0/654a348668add8c89454af34_Chad%20Stahelski.jpg",
  "director-chad-stahelski": "https://cdn.prod.website-files.com/652e1d0f532c272ff40207d0/654a348668add8c89454af34_Chad%20Stahelski.jpg",
  "indiana-jones": "https://cdn.artphotolimited.com/images/5b9fc1ecac06024957be8806/1000x1000/harrison-ford-en-1993.jpg",
  "christopher-nolan": "https://static.time.com/v3/assets/bltea6093859af6183b/blt1ea6b6a2f1266e7f/698a443b86f68e461e6f32b9/christopher-nolan-01.jpg?branch=production&width=3840&quality=75&auto=webp&crop=3:2",
  "director-christopher-nolan": "https://static.time.com/v3/assets/bltea6093859af6183b/blt1ea6b6a2f1266e7f/698a443b86f68e461e6f32b9/christopher-nolan-01.jpg?branch=production&width=3840&quality=75&auto=webp&crop=3:2",
  "tarantino-collection": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDZe6FkKBAg8o5bmQjh2R131IigXlgx7BuWIEBRHviZg&s=10",
  "director-quentin-tarantino": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDZe6FkKBAg8o5bmQjh2R131IigXlgx7BuWIEBRHviZg&s=10",
  "star-wars": "https://i.pinimg.com/564x/02/47/3b/02473babb95b7c65b57988a18eaa4357.jpg",
  "james-bond": "https://i.pinimg.com/236x/96/19/44/961944b5871a75672192deddd25fe830.jpg",
  "rocky": "https://preview.redd.it/my-first-attempt-at-rocky-balboa-might-edit-and-try-to-make-v0-5bykoynyb39b1.jpg?width=640&crop=smart&auto=webp&s=35b2c22ad2399c920878b54ded38a45b1502198d",
  "terminator": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKBqbea29sYZRGpKMKWWQuHIoFddVvc2Pc3T99QbeC8AtAdfSF3IgU4jB5&s=10",
  "director-frank-darabont": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYkJ9a3HkUEPf9YprNRzIerQpqWEVCVuse1U_VDAVQhaTt1G74tCKxNQWj&s=10",
  "fast-and-furious": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXrgAjZyB1A4tvs4McappxohGUnoaI7KI_CWGJV98pi5n-mw_Q8Ig8rBJT&s=10",
  "director-brett-ratner": "https://image.tmdb.org/t/p/w500/nraZoTzwJQPHspAVsKfgl3RXKKa.jpg",
  "batman": "https://w0.peakpx.com/wallpaper/921/848/HD-wallpaper-christian-bale-batman-cool-movie-actor.jpg",
  "franchise-batman": "https://w0.peakpx.com/wallpaper/921/848/HD-wallpaper-christian-bale-batman-cool-movie-actor.jpg",
  "mafia-movies": "https://cdn.artphotolimited.com/images/60913d60bd40b85323893a87/1000x1000/al-pacino-super-star.jpg",
  "mind-bending-mysteries": "https://images.mubicdn.net/images/cast_member/3071/cache-3195-1568084972/image-w856.jpg",
  "matrix": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDZe6FkKBAg8o5bmQjh2R131IigXlgx7BuWIEBRHviZg&s=10"
};"""

content = re.sub(r'// Hand-crafted high-fidelity collection backgrounds custom-generated\s*const COLLECTION_BANNERS: Record<string, string> = \{[\s\S]*?\};', new_banners, content)


generic_render = """                      {COLLECTION_BANNERS[c.id] && (
                        <div 
                          className="absolute right-0 bottom-0 top-0 w-[80%] sm:w-[60%] opacity-30 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none bg-no-repeat bg-[center_top_10%] bg-cover" 
                          style={{ 
                            backgroundImage: `url('${COLLECTION_BANNERS[c.id]}')`, 
                            mixBlendMode: 'lighten',
                            WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
                            maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)'
                          }}
                        />
                      )}"""

content = re.sub(r'{\s*c\.id === "tarantino-collection" && \([\s\S]*?{\s*c\.id === "star-wars" && \([\s\S]*?/>\s*\)}', generic_render, content)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Patched successfully.")
