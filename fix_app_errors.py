import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Fix resume-lecture
content = content.replace(
    '''id={`carousel-container-resume-lecture`}
                        ref={(el) => {
                          carouselRefs.current['resume-lecture'] = el;
                        }}
                        className={`flex overflow-x-auto no-scrollbar pt-4 px-1 pb-6 sm:pb-10 ${collection.id === "trending-now" ? "gap-6 sm:gap-10" : "gap-4 sm:gap-8"}`}''',
    '''id={`carousel-container-resume-lecture`}
                        ref={(el) => {
                          carouselRefs.current['resume-lecture'] = el;
                        }}
                        className="flex gap-4 sm:gap-8 overflow-x-auto no-scrollbar pt-4 px-1 pb-6 sm:pb-10"'''
)

# Fix other-bangers
content = content.replace(
    '''id={`carousel-container-other-bangers`}
                        ref={(el) => {
                          carouselRefs.current["other-bangers"] = el;
                        }}
                        className={`flex overflow-x-auto no-scrollbar pt-4 px-1 pb-6 sm:pb-10 ${collection.id === "trending-now" ? "gap-6 sm:gap-10" : "gap-4 sm:gap-8"}`}''',
    '''id={`carousel-container-other-bangers`}
                        ref={(el) => {
                          carouselRefs.current["other-bangers"] = el;
                        }}
                        className="flex gap-4 sm:gap-8 overflow-x-auto no-scrollbar pt-4 px-1 pb-6 sm:pb-10"'''
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed TS errors")
