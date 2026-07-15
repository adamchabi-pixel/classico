import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

pattern = re.compile(r'({\s*c\.id === "rocky" && \([\s\S]*?/>\s*\)})')

def repl(m):
    return m.group(1) + """
                      {c.id === "indiana-jones" && (
                        <div 
                          className="absolute right-[-20px] sm:right-[-40px] bottom-0 top-0 w-[60%] sm:w-[50%] opacity-30 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none bg-no-repeat bg-right bg-cover" 
                          style={{ 
                            backgroundImage: `url('https://cdn.artphotolimited.com/images/5b9fc1ecac06024957be8806/1000x1000/harrison-ford-en-1993.jpg')`, 
                            mixBlendMode: 'lighten',
                            WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)',
                            maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)'
                          }}
                        />
                      )}
                      {c.id === "mafia-movies" && (
                        <div 
                          className="absolute right-[-20px] sm:right-[-40px] bottom-0 top-0 w-[60%] sm:w-[50%] opacity-30 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none bg-no-repeat bg-right bg-cover" 
                          style={{ 
                            backgroundImage: `url('https://cdn.artphotolimited.com/images/60913d60bd40b85323893a87/1000x1000/al-pacino-super-star.jpg')`, 
                            mixBlendMode: 'lighten',
                            WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)',
                            maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)'
                          }}
                        />
                      )}
                      {c.id === "mind-bending-mysteries" && (
                        <div 
                          className="absolute right-[-20px] sm:right-[-40px] bottom-0 top-0 w-[60%] sm:w-[50%] opacity-30 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none bg-no-repeat bg-right bg-cover" 
                          style={{ 
                            backgroundImage: `url('https://images.mubicdn.net/images/cast_member/3071/cache-3195-1568084972/image-w856.jpg')`, 
                            mixBlendMode: 'lighten',
                            WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)',
                            maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)'
                          }}
                        />
                      )}
                      {c.id === "star-wars" && (
                        <div 
                          className="absolute right-[-20px] sm:right-[-40px] bottom-0 top-0 w-[60%] sm:w-[50%] opacity-30 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none bg-no-repeat bg-right bg-cover" 
                          style={{ 
                            backgroundImage: `url('https://www.d20radio.com/main/wp-content/uploads/2017/02/darth-vader.jpg')`, 
                            mixBlendMode: 'lighten',
                            WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)',
                            maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)'
                          }}
                        />
                      )}"""

new_content = pattern.sub(repl, content)

if new_content != content:
    with open("src/App.tsx", "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Patched successfully.")
else:
    print("Target not found.")

