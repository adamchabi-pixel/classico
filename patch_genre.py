import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

old_logic = """    const finalCollections = [
      ...curatedSagaCollections,
      ...dynamicFranchiseCollections,
      ...dynamicDirectorCollections
    ];"""

new_logic = """    const finalCollections = [
      ...curatedSagaCollections,
      ...dynamicFranchiseCollections,
      ...dynamicDirectorCollections,
      ...genreCollections
    ];"""

content = content.replace(old_logic, new_logic)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
