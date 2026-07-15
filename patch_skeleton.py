import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_collections_block = """              {/* Collections Segment block - Horizontal Carousels grouped by Collection */}
              <div className="max-w-[2000px] mx-auto px-4 sm:px-8 space-y-12 pb-16">"""

new_collections_block = """              {/* Collections Segment block - Horizontal Carousels grouped by Collection */}
              {isJellyfinLoading && mappedCollections.length === 0 ? (
                <div className="max-w-[2000px] mx-auto px-4 sm:px-8 space-y-12 pb-16 pt-12">
                   {[1,2,3].map(i => (
                     <div key={i} className="space-y-4">
                       <div className="h-8 w-48 bg-zinc-900 rounded-lg animate-pulse" />
                       <div className="flex gap-4 overflow-hidden">
                          {[1,2,3,4,5,6].map(j => (
                             <div key={j} className="h-[200px] sm:h-[220px] min-w-[300px] sm:min-w-[400px] bg-neutral-900/60 rounded-2xl border border-zinc-800/80 animate-pulse shrink-0" />
                          ))}
                       </div>
                     </div>
                   ))}
                </div>
              ) : null}

              <div className="max-w-[2000px] mx-auto px-4 sm:px-8 space-y-12 pb-16">"""

content = content.replace(old_collections_block, new_collections_block)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
