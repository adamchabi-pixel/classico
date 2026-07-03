import re

with open("src/App.tsx", "r") as f:
    content = f.read()

target1 = """    const savedProgress = localStorage.getItem("classico_progress");
    if (savedProgress) {
      try {
        setProgressData(JSON.parse(savedProgress));
      } catch (e) {
        console.error(e);
      }
    }"""
replacement1 = """    const savedProgress = localStorage.getItem("classico_progress");
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        const newProgressData: Record<string, number> = {};
        Object.keys(parsed).forEach(k => {
           if (typeof parsed[k] === 'number') newProgressData[k] = parsed[k];
           else if (parsed[k] && parsed[k].duration) newProgressData[k] = parsed[k].currentTime / parsed[k].duration;
        });
        setProgressData(newProgressData);
      } catch (e) {
        console.error(e);
      }
    }"""

target2 = """          const savedProgress = localStorage.getItem("classico_progress");
          if (savedProgress) {
            try {
              setProgressData(JSON.parse(savedProgress));
            } catch (e) {}
          }"""
replacement2 = """          const savedProgress = localStorage.getItem("classico_progress");
          if (savedProgress) {
            try {
              const parsed = JSON.parse(savedProgress);
              const newProgressData: Record<string, number> = {};
              Object.keys(parsed).forEach(k => {
                 if (typeof parsed[k] === 'number') newProgressData[k] = parsed[k];
                 else if (parsed[k] && parsed[k].duration) newProgressData[k] = parsed[k].currentTime / parsed[k].duration;
              });
              setProgressData(newProgressData);
            } catch (e) {}
          }"""

if target1 in content:
    content = content.replace(target1, replacement1)
else:
    print("Could not find target1")

if target2 in content:
    content = content.replace(target2, replacement2)
else:
    print("Could not find target2")

with open("src/App.tsx", "w") as f:
    f.write(content)
