import os

# Directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

output_file = os.path.join(BASE_DIR, "folders.txt")

folders = [
    name for name in os.listdir(BASE_DIR)
    if os.path.isdir(os.path.join(BASE_DIR, name))
    and not name.startswith(".")
]

folders.sort()

with open(output_file, "w", encoding="utf-8") as f:
    for folder in folders:
        f.write(folder + "\n")

print(f"Exported {len(folders)} folders to folders.txt")
