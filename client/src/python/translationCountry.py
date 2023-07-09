# -*- coding: utf-8 -*-
import json
import wikipedia
from bs4 import BeautifulSoup
import urllib.request as urllib2
import urllib.parse as parse
import re
import time
import tqdm
import os


plus = "\033[32m+\033[39m"
minus = "\033[31m+\033[39m"


# Dictionnaires
adjust = {
    "Bougainville": "Autonomous Region of Bougainville",
    "Galicia" : "Galicia (Spain)",
    "Georgia" : "Georgia (country)",
    "Saba": "Saba (island)",
    "Palestine": "State_of_Palestine",
    "Vatican": "Vatican_City",
    "Basque_Country": "Basque Country (autonomous community)",
    "South_Moluccas": "Republic_of_South_Maluku"
}

corr = {
    "ar": "Arabic",
    "da": "Danish",
    "de": "German",
    "eo": "Esperanto",
    "es": "Spanish",
    "fr": "French",
    "fi": "Finish",
    "id": "Indonesian",
    "it": "Italian",
    "ja": "Japanese",
    "ko": "Korean",
    "nl": "Dutch",
    "nw": "Norway",
    "no": "Norway",
    "pl": "Polish",
    "pt": "Portugese",
    "ru": "Russian",
    "sv": "Swedish",
    "th": "Thai",
    "tr": "Turquish",
    "uk": "Ukrainian",
    "vi": "vietnamese",
    "zh": "Chinese",
}

langs = [
    "ar", # Arabe
    "da", # Danois
    "de", # Allemand
    "eo", # Esperanto
    "es", # Espagnol
    "fr", # Français
    "fi", # Finlandais
    "id", # Indonésien
    "it", # Italie
    "ja", # Japon
    "ko", # Corée
    "nl", # Pays-bas
    "nw", # Norvège
    "pl", # Pologne
    "pt", # Portugais
    "ru", # Russie
    "sv", # Suédois
    "th", # Thaïlandais
    "tr", # Turc
    "uk", # Ukrainien
    "vi", # Vietnamien
    "zh", # Chinois
]




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



# Update the translation of a language
def add_translation_language(lang: str, translation: dict[str, str]) -> None:

    """ Update the translation of a language"""

    with open(f"public/locales/{lang}/translation.json", 'r') as f:
        current_translation = json.load(f)
        current_translation.update(translation)
    with open(f"public/locales/{lang}/translation.json", 'w') as f:
        f.write(write_dic(current_translation))



def get_translation(origin: str, to: str, txt: str) -> str:
    # c = pycurl.Curl()

    # #initializing the request URL
    # c.setopt(c.URL, 'https://api-free.deepl.com/v2/translate')
    # #the data that we need to Post
    # post_data = {'field': 'value'}
    # # encoding the string to be used as a query
    # postfields = urlencode(post_data)
    # #setting the cURL for POST operation
    # c.setopt(c.POSTFIELDS, postfields)
    # # perform file transfer
    # c.perform()
    # #Ending the session and freeing the resources
    # c.close()
    pass


# Get the translation of a country with Wikipédia
def get_country_translation(name: str, lang: str) -> str:

    """ Get the translation of a country with Wikipédia """

    name = "_".join(name.split())

    if name in adjust:
        name = adjust[name]

    try:
        title = wikipedia.page(name, auto_suggest=False).title
    except Exception as err:
        print(f"{minus} {name} not found: {err}.")
        return

    # Get languages and links
    soup =  BeautifulSoup(urllib2.urlopen(f'http://en.wikipedia.org/wiki/{parse.quote(name)}'), 'html.parser')
    links = {el.get('lang'): el.get('href') for el in soup.select('li.interlanguage-link > a')}

    if not lang in links:
        print(f"{minus} ERROR: {title} not present for {corr[lang]} ")
        return


    url = links[lang]
    soup = BeautifulSoup(urllib2.urlopen(url), 'html.parser')
    return "-".join(soup.title.text.replace(u'\u2013',"-").replace(u'\u2014',"-").split("-")[:-1])



# Update the language with convertCountry.json
def update(lang: str) -> None:

    """ Update the language of a country with convertCountry.json """

    json_lang = {}
    with open(f"src/lang/{lang}.json", "r") as f:
        json_lang.update(json.load(f).items())
        with open(f"src/utils/convertCountry.json", "r") as cc:
            json_tot = json.load(cc).items()
            for k,v in json_tot:
                if not v in json_lang:
                    json_lang[v] = re.sub("[\(\[].*?[\)\]]", "",str(get_country_translation(v, lang))).strip()
                    print(f"{plus} Added {v} with {corr[lang]}")
    with open(f"src/lang/{lang}.json", "w") as f:
        f.write(write_dic(sort_dic(json_lang)))



# Sort a file by the lang
def sort_file(lang: str) -> None:
    dic = json.load(open(f"src/lang/{lang}.json"))
    with open(f"src/lang/{lang}.json", "w") as f:
        f.write(write_dic(sort_dic(dic)))


def get_all_nones(lang: str) -> list[str]:
    tot = []
    dic = json.load(open(f"src/lang/{lang}.json"))

    for k,v in dic.items():
        if v == "None":
            tot.append(k)

    return tot





##########################
#         Main           #
##########################
if __name__ == '__main__':

    # Sort convertCountry.json
    dic = json.load(open(f"src/utils/convertCountry.json"))
    with open(f"src/utils/convertCountry.json", "w") as f:
        f.write(write_dic(sort_dic(dic)))
        print(f"{plus} Sorted the convert country")


    #################
    #   Add langs   #
    #################
    for lang in langs:
        with open(f"src/lang/{lang}.json","w") as f:
            print(f"Starting {corr[lang]}...")
            with open(f"src/utils/convertCountry.json") as cc:
                f.write("{\n\t")
                tot = []
                for k,v in tqdm.tqdm(json.load(cc).items()):
                    q = get_country_translation(v, lang)
                    newstring = re.sub("[\(\[].*?[\)\]]", "",str(q)).strip()
                    tot.append(f'"{v}": "{newstring}"')
                    # os.system('clear')
                    # print(f"Added {v} in {q} ({lang})")
                    # time.sleep(1)
                f.write(",\n\t".join(tot))
                f.write("\n}")


    ####################
    #   Update langs   #
    ####################
    for lang in langs:
        try: 
            print("UPDATE...")
            update(lang)
        except Exception as err:
            print(f"{minus} {corr[lang]} doesn't exists")


    ##################
    #   Sort langs   #
    ##################
    for lang in langs:
        try:
            sort_file(lang)
            print(f"{plus} Sorted {corr[lang]}")
        except Exception as err:
            print(f"{minus} {corr[lang]} doesn't exists")


    ######################
    #   Get None langs   #
    ######################
    for lang in langs:
        try:
            print("=-=-=-=-=-=-=-=-=-=")
            # print(f"Here are all the none for {corr[lang]}:\n" + ("\n".join(get_all_nones(lang)) or "None"))
            print(f"Can you traduct all theses country name that are written in english to {corr[lang]}:\n" + ("\n".join(get_all_nones(lang)) or "None"))
        except Exception as err:
            print(f"{minus} {corr[lang]} doesn't exists: {err}")
