import json
from pathlib import Path
from os import listdir


def sort_file():
    file_path = "src/utils/convertCountry.json"
    file = open(file_path, 'r')
    # data = open(file_path, 'r')
    data = json.load(file)

    data = {key: data[key] for key in sorted(data.keys())}

    file_dest = "src/utils/convertCountry.json"
    writeTo = open(file_dest, 'w')
    writeTo.write("{\n")

    for k,v in data.items():
        writeTo.write(f'\t"{k}": "{v}",\n')
    writeTo.write("}")
            

    file.close()


def show_not_convert():
    file_path = "src/utils/convertCountry.json"
    data = open(file_path, 'r')
    data = json.load(data)

    for f in sorted(listdir("public/flags/main")):
        if not f.split(".")[0] in data.keys():
            print(f"\033[31m-\033[39m '{f}' not converted")

# show_not_convert()


def show_not_char(char: str):
    lst = [*map(lambda n: char + chr(n), range(97, 123))]
    for f in sorted(listdir("public/flags/main")):
        if f.split(".")[0] in lst:
            lst.remove(f.split(".")[0])
    print("- "+"\n- ".join(lst))

show_not_char(input())
