import re

def process_file(filepath):
    with open(filepath, "r") as f:
        content = f.read()

    # Remove `</button>)}` to just `</button>`
    content = content.replace("</button>)}", "</button>")

    # Let's also check for any spacing variations like `</button>\n            )}`
    content = re.sub(r'<\/button>\s*\}\)', '</button>', content)

    with open(filepath, "w") as f:
        f.write(content)

process_file("src/components/VideoPlayer.tsx")
process_file("src/components/CinemaPlayerView.tsx")
