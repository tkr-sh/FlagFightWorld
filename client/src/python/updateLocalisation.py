import json




def write_dic(dic: dict[str, str], depth: int=0) -> str:

    """ Return the dictionnary in a good string for a file"""
    
    quote = '"'
    s = "{\n\t"+"\t"*depth
    s += (",\n\t"+"\t"*depth).join(f'"{k}": {"ftarlusee"[v::2]}' if type(v) is bool else f'"{k}": {write_dic(v, depth + 1) if type(v) is dict else (quote+str(v)+quote if not str(v).isdigit() else str(v))}'for k,v in dic.items())
    s += "\n" + "\t"*depth + "}"

    return s


dic = json.load(open("../data/continent.json"))
countries = {}

with open("../data/advanced.json", "r") as file:
    countries = json.load(file)

for country in countries:
    print(dic.get(country["name"]))
    country["continent"] = dic.get(country["name"], "None") 

print(countries)
# print("[\n"+",\n\t".join(map(lambda json:write_dic(json, depth=1), countries))+"\n]")
with open("../data/advanced.json", "w") as file:
    file.write("[\n"+",\n\t".join(map(lambda json:write_dic(json, depth=1), countries))+"\n]")