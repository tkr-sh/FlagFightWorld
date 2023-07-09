import json

#=== Lang ===#
origin = """Bangsamoro
Barotseland
Brittany
Guernsey
Republic of West Papua
South Moluccas"""

destination = """Bangsamoro
Barotseland
Bretania
Guernsey
Republika Papui Zachodniej
Południowe Moluki"""

lang = "pl"

#============#




# Return the dictionnary in a good string for a file
def write_dic(dic: dict[str, str]) -> str:

    """ Return the dictionnary in a good string for a file"""

    s = "{\n\t"
    s += ",\n\t".join(f'"{k}": "{v}"'for k,v in dic.items())
    s += "\n}"
    return s


# Sort a dictionnary by keys
def sort_dic(dic: dict[str, str]) -> dict[str, str]:
    return dict(sorted(dic.items()))




if __name__ == "__main__":

    dic = {}
    for k,v in zip(origin.splitlines(), destination.splitlines()):
        dic[k] = v
        # print(f'"{k}": "{v}",')

    json_dic = json.load(open(f"src/lang/{lang}.json"))
    json_dic.update(dic)
    with open(f"src/lang/{lang}.json", "w") as f:
        f.write(write_dic(sort_dic(json_dic)))
