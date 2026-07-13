import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

# Fix the resume lecture one:
text = text.replace(
    'className={`flex overflow-x-auto no-scrollbar py-2.5 px-1 pb-4 ${collection.id === "trending-now" ? "gap-6 sm:gap-10" : "gap-3 sm:gap-6"}`}',
    'className="flex gap-3 sm:gap-6 overflow-x-auto no-scrollbar py-2.5 px-1 pb-4"'
)
# Now all 3 are reverted to normal.

# Now only replace the one inside the collection loop:
old_loop = """                        <div
                          id={`carousel-container-${collection.id}`}
                          ref={(el) => {
                            carouselRefs.current[collection.id] = el;
                          }}
                          className="flex gap-3 sm:gap-6 overflow-x-auto no-scrollbar py-2.5 px-1 pb-4"
                        >"""
new_loop = """                        <div
                          id={`carousel-container-${collection.id}`}
                          ref={(el) => {
                            carouselRefs.current[collection.id] = el;
                          }}
                          className={`flex overflow-x-auto no-scrollbar py-2.5 px-1 pb-4 ${collection.id === "trending-now" ? "gap-4 sm:gap-8" : "gap-3 sm:gap-6"}`}
                        >"""
text = text.replace(old_loop, new_loop)

with open('src/App.tsx', 'w') as f:
    f.write(text)
