import json
from os import listdir
from os.path import isfile, join



PATH = "public/flags/main"
imgs = sorted([f for f in listdir(PATH) if isfile(join(PATH, f))])
dic = json.load(open("src/utils/similarFlags.json", 'r'))



def replace_arr(l, origin, to):
    return list(map(lambda x: x.replace(origin, to), l))



for img in imgs:
    flag = img.split(".")[0]
    similar_flags = []

    if dic.get(flag, None) is not None and len(dic.get(flag, [])) != 0:
        print(flag, "is already defined")
        continue



    for k,v in dic.items():
        if flag in v:
            similar_flags += replace_arr(v, flag, k)

    similar_flags = [*set(similar_flags),]


    print(flag, similar_flags)

