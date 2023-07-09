# pip install scour
# Imports
from os import listdir, system
from os.path import isfile, join
from tqdm import tqdm
from re import sub

# Type of images that you want to optimize
FLAGS=False
ICONS=True




if FLAGS:
    path = "public/flags/main/"
    imgs = [f for f in listdir(path) if isfile(join(path, f))]

    print("Optimizing images...")

    for img in tqdm(imgs):
        system(f"svgo '{path}{img}' -o '{path}../new/{img}'")
        print("\033[H\033[3J", end="")
    print("Flags optimized...")

if ICONS:
    path = "client/src/assets/icons/"
    imgs = [f for f in listdir(path) if isfile(join(path, f))]

    print("Optimizing images...")

    for img in tqdm(imgs):
        system(f"svgo '{path}{img}' -o '{path}../new/{img}'")
        print("\033[H\033[3J", end="")


    print("Removing HTML comments...")
    for img in tqdm(imgs):
        txt = open(path  + '../new/' + img).read()
        print(txt)
        open(path + '../new/' + img, "wt").write(sub(r"<!--(.|\s|\n)*?-->", "", txt))

    print("Flags optimized...")
    
