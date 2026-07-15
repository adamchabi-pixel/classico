import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

pattern = re.compile(r'{\s*c\.id === "james-bond" && \([\s\S]*?/>\s*\)}')

def repl(m):
    return """{c.id === "james-bond" && (
                        <div 
                          className="absolute right-[-10px] sm:right-[-20px] bottom-0 top-0 w-[60%] sm:w-[50%] opacity-30 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none bg-no-repeat bg-right bg-cover" 
                          style={{ 
                            backgroundImage: `url('https://dnm.nflximg.net/api/v6/2DuQlx0fM4wd1nzqm5BFBi6ILa8/AAAAQb9g_YOdpSx4h4uFrdaPDo_f7KYnFcqlKtjtDGlw_Q3Z1xx-tsR4S_bAsWjPFT2QqTkz7_KsWa_pqRei3v5DIhlRN1SBsB1fqiezetQzgz0F1rZ9o2tAyXBI7rMYWl0xKCs6A60_RgJSamwTsYUmrmLx.jpg?r=d28')`, 
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

