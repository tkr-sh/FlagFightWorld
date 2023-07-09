# -*- coding: utf-8 -*-
import json
import wikipedia
from bs4 import BeautifulSoup
import urllib.request as urllib2
import urllib.parse as parse
import re
from tqdm import tqdm


# Dictionnaires
adjust = {
    "Bougainville": "Autonomous Region of Bougainville",
    "Galicia" : "Galicia (Spain)",
    "Georgia" : "Georgia (country)",
    "Guernsey": "Bailiwick of Guernsey",
    "Saba": "Saba (island)",
    "Palestine": "State of Palestine",
    "Vatican": "Vatican City",
    "Basque_Country": "Basque Country (autonomous community)",
    "Ireland": "Republic of Ireland",
    "South_Moluccas": "Maluku (province)"
}

plus = "\033[32m+\033[39m"
minus = "\033[31m+\033[39m"


def striphtml(data):
    p = re.compile(r'<.*?>')
    return p.sub('', data)

def strip_par(data):
    p = re.compile(r'\(.*?\)')
    q = re.compile(r'\[.*?\]')
    return q.sub('',p.sub('', data))


# Return the dictionnary in a good string for a file
def write_dic(dic: dict[str, str], depth: int=0) -> str:

    """ Return the dictionnary in a good string for a file"""
    
    quote = '"'
    s = "{\n\t"+"\t"*depth
    s += (",\n\t"+"\t"*depth).join(f'"{k}": {write_dic(v, depth + 1) if type(v) is dict else (quote+str(v)+quote if not str(v).isdigit() else str(v))}'for k,v in dic.items())
    s += "\n" + "\t"*depth + "}"

    return s


def get_wikipedia_title(title: str) -> str:

    """ Get the wikipedia page by title """

    title = "_".join(title.split())

    if title in adjust:
        title = adjust[title]

    try:
        return wikipedia.page(title, auto_suggest=False).title
    except Exception as err:
        print(f"{minus} {title} not found: {err}.")
        return


def get_nb_traduction(title: str):
    file = BeautifulSoup(urllib2.urlopen(f'http://en.wikipedia.org/wiki/{parse.quote(title)}'), 'html.parser') \
    .prettify() \
    .splitlines()

    tot = sum(map(lambda l: "interlanguage-link interwiki" in l, file))

    return tot




def get_population(country: str) -> int:

    """ Get the wikipedia page by title """

    tr = BeautifulSoup(urllib2.urlopen(f'http://en.wikipedia.org/wiki/{parse.quote(country)}'), 'html.parser') \
    .select(".vcard tr")

    waiting_population = False
    # print(tr)

    for data in tr:
        # print(data)
        if "Population" in striphtml(str(data)):
            waiting_population = True

        if waiting_population:
            if not "<td " in str(data):
                continue

            first_td = data.select("td")[0]

            if "<li" in str(data):
                first_td = first_td.select("li")[0]

            # print(striphtml(str(first_td)))
            # print(country, "{:,}".format(int("".join(filter(lambda c: c.isdigit(),strip_par(striphtml(str(first_td))))))))
            return int("".join(filter(lambda c: c.isdigit(),strip_par(striphtml(str(first_td))))))

    # print(tst)
    # print(len(tst))

    # .splitlines()



    # print(country)
    # for result in results["results"]["bindings"]:
    #     print(result)
    # return int(results["results"]["bindings"][0]["population"]["value"])


json_tot = {}
# json_tot = {'Aboriginal Australians': 51, 'Scotland': 207, 'Saint Helena': 120, 'Andorra': 270, 'United Arab Emirates': 235, 'Afghanistan': 268, 'Antigua and Barbuda': 217, 'Nagorno-Karabakh': 106, 'Anguilla': 131, 'Adjara': 90, 'Abkhazia': 161, 'Albania': 277, 'Armenia': 269, 'Austral Islands': 46, 'Angola': 253, 'Antarctica': 245, 'Argentina': 282, 'American Samoa': 136, 'Austria': 284, 'Australia': 285, 'Aosta Valley': 115, 'Aruba': 158, 'Åland': 136, 'Azerbaijan': 283, 'Azores': 112, 'Bosnia and Herzegovina': 265, 'British Antarctic Territory': 70, 'Barbados': 221, 'Basque Country': 123, 'Bangladesh': 262, 'Belgium': 278, 'Burkina Faso': 236, 'Bulgaria': 280, 'Bahrain': 239, 'Burundi': 238, 'Benin': 243, 'Bangsamoro': 35, 'Bermuda': 150, 'Brunei': 240, 'Bolivia': 250, 'Brazil': 286, 'Bahamas': 224, 'Bhutan': 244, 'Bougainville': 50, 'Botswana': 245, 'Barra': 33, 'Belarus': 276, 'Belize': 233, 'Brittany': 69, 'Canada': 292, 'Cocos Islands': 116, 'The Democratic Republic of Congo': 248, 'Ceuta': 129, 'CEFTA': 40, 'Central African Republic': 232, 'Republic of the Congo': 231, 'Switzerland': 282, 'Ivory Coast': 241, 'Cook Islands': 144, 'Chile': 296, 'Cameroon': 240, 'China': 300, 'Colombia': 282, 'Costa Rica': 231, 'Catalonia': 168, 'Cuba': 253, 'Cape Verde': 228, 'Curaçao': 121, 'Christmas Island': 123, 'Cyprus': 253, 'Czech Republic': 274, 'Germany': 295, 'Djibouti': 233, 'Denmark': 278, 'Dominica': 211, 'Dominican Republic': 210, 'Algeria': 269, 'Ecuador': 241, 'Estonia': 280, 'Egypt': 280, 'Western Sahara': 159, 'Easter Island': 131, 'England': 229, 'Eritrea': 241, 'Spain': 292, 'Ethiopia': 261, 'Europe': 294, 'Finland': 312, 'Fiji Islands': 212, 'Falkland Islands': 150, 'Micronesia': 116, 'Faroe Islands': 170, 'France': 295, 'African Union': 140, 'Federal Dependencies of Venezuela': 35, 'Gabon': 232, 'United Kingdom': 285, 'Galicia': 134, 'Grenada': 205, 'Georgia': 262, 'French Guiana': 168, 'Guernsey': 24, 'Ghana': 252, 'Gibraltar': 170, 'Greenland': 194, 'Gambia': 232, 'Guinea': 229, 'Galápagos Islands': 103, 'Guadeloupe': 137, 'Equatorial Guinea': 221, 'Greece': 281, 'South Georgia and the South Sandwich Islands': 116, 'Guatemala': 231, 'Guam': 149, 'Friuli Venezia Giulia': 112, 'Guinea-Bissau': 226, 'Guyana': 228, 'Gagauzia': 78, 'Helgoland': 79, 'Hong Kong': 231, 'Honduras': 227, 'Croatia': 275, 'Haiti': 222, 'Hungary': 268, 'Ascension Island': 86, 'Canary Islands': 159, 'Indonesia': 271, 'Ireland': 140, 'Gambier Islands': 45, 'Israel': 272, 'Isle of Man': 142, 'India': 292, 'British Indian Ocean Territory': 96, 'Iraq': 256, 'Iran': 279, 'Iceland': 270, 'Italy': 307, 'Jersey': 121, 'Jamaica': 230, 'Jordan': 238, 'Japan': 312, 'Azad Kashmir': 72, 'Kenya': 252, 'Kyrgyzstan': 240, 'Cambodia': 246, 'Kiribati': 202, 'Karakalpakstan': 81, 'Comoros': 224, 'Saint Kitts and Nevis': 192, 'North Korea': 242, 'South Korea': 262, 'Kurdistan': 104, 'Kosovo': 207, 'Kuwait': 231, 'Cayman Islands': 135, 'Kazakhstan': 264, 'Laos': 245, 'Lebanon': 245, 'Saint Lucia': 194, 'Liechtenstein': 255, 'Sri Lanka': 234, 'Liberia': 232, 'Lesotho': 225, 'Lithuania': 275, 'Luxembourg': 263, 'Latvia': 262, 'Leeward Islands': 37, 'Libya': 247, 'Morocco': 251, 'Monaco': 255, 'Moldova': 259, 'Montenegro': 247, 'Melilla': 122, 'Madagascar': 242, 'Marshall Islands': 191, 'Madeira': 119, 'Marquesas Islands': 72, 'North Macedonia': 251, 'Mali': 234, 'Myanmar': 243, 'Mongolia': 248, 'Macao': 186, 'Northern Mariana Islands': 126, 'Martinique': 144, 'Mauritania': 233, 'Montserrat': 123, 'Malta': 259, 'Mauritius': 219, 'Maldives': 223, 'Malawi': 229, 'Mexico': 308, 'Malaysia': 259, 'Mozambique': 237, 'Namibia': 244, 'New Caledonia': 143, 'North Ireland': 169, 'Niger': 228, 'Norfolk Island': 119, 'Nigeria': 256, 'Nicaragua': 224, 'Netherlands': 279, 'Norway': 299, 'Nepal': 248, 'Nauru': 207, 'Niue': 144, 'Nevis': 49, 'Northern Cyprus': 141, 'New Zealand': 260, 'Orkney': 78, 'Oman': 228, 'Bonaire': 91, 'South Ossetia': 150, 'Panama': 226, 'Peru': 250, 'French Polynesia': 134, 'Papua New Guinea': 224, 'Philippines': 256, 'Pakistan': 261, 'Poland': 294, 'Saint Pierre and Miquelon': 117, 'Pitcairn': 125, 'Puerto Rico': 168, 'Palestine': 136, 'Portugal': 280, 'Puntland': 62, 'Palau': 205, 'Paraguay': 242, 'Qatar': 233, 'Quebec': 158, 'Barbuda': 62, 'Rodrigues': 53, 'Réunion': 145, 'Crimea': 145, 'Arab league': 131, 'Romania': 267, 'Serbia': 268, 'Russia': 312, 'Rwanda': 233, 'Saudi Arabia': 256, 'Solomon Islands': 193, 'Seychelles': 212, 'Sudan': 244, 'Sweden': 278, 'Singapore': 250, 'Shetland': 85, 'Slovenia': 263, 'Svalbard and Jan Mayen': 45, 'Slovakia': 267, 'Sierra Leone': 227, 'San Marino': 253, 'Senegal': 231, 'Somalia': 241, 'Republika Srpska': 83, 'Somaliland': 126, 'Suriname': 224, 'South Sudan': 212, 'Sao Tome and Principe': 213, 'Sint Eustatius': 81, 'El Salvador': 221, 'Sint Maarten': 101, 'Syria': 248, 'Swaziland': 225, 'Tristan da Cunha': 82, 'Tibet': 140, 'Turks and Caicos Islands': 126, 'Chad': 243, 'Trento': 90, 'Kerguelen Islands': 68, 'Togo': 233, 'Thailand': 258, 'Trentino-Alto Adige/Südtirol': 116, 'Tajikistan': 239, 'Tokelau': 121, 'East Timor': 226, 'Turkmenistan': 235, 'Tunisia': 243, 'Tonga': 202, 'Turkey': 308, 'Transnistria': 129, 'Trinidad and Tobago': 203, 'Tuamotus': 67, 'Tuvalu': 201, 'Taiwan': 231, 'South Tyrol': 88, 'Tanzania': 247, 'Ukraine': 292, 'Uganda': 237, 'South Uist': 34, 'United Nations': 274, 'Union of South American Nations': 64, 'United States': 308, 'Uruguay': 240, 'Uzbekistan': 237, 'Vatican': 257, 'Saint Vincent and the Grenadines': 183, 'Venezuela': 257, 'Virgin Islands, British': 126, 'Virgin Islands, U.S.': 125, 'Vojvodina': 89, 'Vietnam': 284, 'Vanuatu': 204, 'Wallis and Futuna': 118, 'Wales': 192, 'Samoa': 203, 'Yemen': 237, 'Isle of Skye': 59, 'Mayotte': 130, 'South Africa': 277, 'Saba': 81, 'Sardinia': 151, 'Zambia': 238, 'Zimbabwe': 241, 'Sicily': 153, 'Zanzibar': 99}
with open(f"src/utils/convertCountry.json", "r") as f:
    for _,v in json.load(f).items():
        title = get_wikipedia_title(v)
        nb = get_nb_traduction(title)
        print(v, "is converted in", nb, "langs")
        json_tot[v] = nb


reversed_json = {}
with open(f"src/utils/convertCountry.json", "r") as f:
    reversed_json.update({v:k for k,v in json.load(f).items()})

print(json_tot)
print(json_tot.keys())
print(write_dic({e: json_tot[e] for e in sorted(json_tot, key=lambda key: json_tot[key])[::-1]}))

final_json = {}
tot_array = []
i = 0
for e in tqdm(sorted(json_tot, key=lambda key: json_tot[key])[::-1]):

    # try:
    #     print(e, "{:,}".format(get_population(e)))
    # except IndexError:
    #     print("No data for", e)
    # except TypeError:
    #     pass
    
    tot_array.append({
        "name": e,
        "difficulty": i//35 + 1,
        "extension": reversed_json[e],
        "traductions": json_tot[e],
        # "population": 3,
        "population": get_population(e),
    })
    
    # final_json[reversed_json[e]] = {
    #     "name": e,
    #     "difficulty": i//35 + 1,
    #     "extension": reversed_json[e],
    #     "traductions": json_tot[e],
    #     "population": get_population(e),
    # }
    i += 1


with open(f"src/data/advanced.json", "w") as f:
    f.write("[\n\t" + ",\n\t".join(map(lambda d: write_dic(d, depth=1), tot_array)) + "\n]")