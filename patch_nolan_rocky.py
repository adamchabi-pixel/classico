import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

pattern_nolan = re.compile(r'{\s*c\.id === "christopher-nolan" && \([\s\S]*?/>\s*\)}')
pattern_rocky = re.compile(r'{\s*c\.id === "rocky" && \([\s\S]*?/>\s*\)}')

def repl_nolan(m):
    return """{c.id === "christopher-nolan" && (
                        <div 
                          className="absolute right-[-80px] sm:right-[-160px] bottom-0 top-0 w-[60%] sm:w-[50%] opacity-30 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none bg-no-repeat bg-right bg-cover" 
                          style={{ 
                            backgroundImage: `url('https://static.time.com/v3/assets/bltea6093859af6183b/blt1ea6b6a2f1266e7f/698a443b86f68e461e6f32b9/christopher-nolan-01.jpg?branch=production&width=3840&quality=75&auto=webp&crop=3:2')`, 
                            mixBlendMode: 'lighten',
                            WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)',
                            maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)'
                          }}
                        />
                      )}"""

def repl_rocky(m):
    return """{c.id === "rocky" && (
                        <div 
                          className="absolute right-[-60px] sm:right-[-120px] bottom-0 top-0 w-[60%] sm:w-[50%] opacity-30 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none bg-no-repeat bg-right bg-cover" 
                          style={{ 
                            backgroundImage: `url('https://seizieme.ca/wp-content/uploads/2022/09/Format-site-web-1.png')`, 
                            mixBlendMode: 'lighten',
                            WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)',
                            maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)'
                          }}
                        />
                      )}"""

content = pattern_nolan.sub(repl_nolan, content)
content = pattern_rocky.sub(repl_rocky, content)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Patched successfully.")
