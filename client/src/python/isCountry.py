import json




countries = open("country.txt").readlines()


# # Return the dictionnary in a good string for a file
# def write_dic(dic: dict[str, str]) -> str:

#     """ Return the dictionnary in a good string for a file"""

#     s = "{\n\t"
#     s += ",\n\t".join(f'"{k}": {"ftarlusee"[v::2]}' if type(v) is bool else f'"{k}": "{v}"'for k,v in dic.items())
#     s += "\n}"

#     return s



def write_dic(dic: dict[str, str], depth: int=0) -> str:

    """ Return the dictionnary in a good string for a file"""
    
    quote = '"'
    s = "{\n\t"+"\t"*depth
    s += (",\n\t"+"\t"*depth).join(f'"{k}": {"ftarlusee"[v::2]}' if type(v) is bool else f'"{k}": {write_dic(v, depth + 1) if type(v) is dict else (quote+str(v)+quote if not str(v).isdigit() else str(v))}'for k,v in dic.items())
    s += "\n" + "\t"*depth + "}"

    return s


true_country = []

for country in countries:
    name = " ".join(country.split()[:-5])
    true_country.append(name)


dic = json.load(open("../data/advanced.json"))

for country in dic:
    country["isCountry"] = country["name"] in true_country


with open("../data/advanced.json", "w") as file:
    print("[\n"+",\n\t".join(map(lambda json:write_dic(json, depth=1), dic))+"\n]")
    file.write("[\n"+",\n\t".join(map(lambda json:write_dic(json, depth=1), dic))+"\n]")