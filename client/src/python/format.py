# Format the dictionnary
import json
from traduct import get_translation

def print_file(log=True):
    z = "Here the list of items to translate:\n"

    with open("src/utils/translation.json") as f:
        # Log
        ###################################################
        if log:                                           #
            print("Here the list of items to translate:") #
        ###################################################

        for line in json.load(f):
            t = f"- {line}"
            # Log
            ###############
            if log:       #
                print(t)  #
            ###############

            z += t + "\n"
    return z

# Return the dictionnary in a good string for a file
def write_dic(dic: dict[str, str]) -> str:

    """ Return the dictionnary in a good string for a file"""

    QUOTE = '"'
    SLASHQUOTE = '\\"'

    s = "{\n\t"
    s += ",\n\t".join(f'"{k.replace(QUOTE, SLASHQUOTE)}": "{v.replace(QUOTE, SLASHQUOTE)}"' for k,v in dic.items())
    s += "\n}"

    return s


def convert_to_json():
    with open("src/tmp/traduction.txt") as f:
        txt = f.readlines()
        data = [*map(lambda s: s.lstrip("- ").rstrip("\n"), txt[1:])]
        origin_data = json.load(open("src/utils/translation.json"))
        dic = {k:v for k,v in zip(origin_data, data)}
        
        with open("src/tmp/temp.json", 'w') as temp:
            temp.write(write_dic(dic))



def total(lang):
    # Get what needs to be translated
    print("Getting the file to translate...")
    s = print_file(log=False)


    # Get the translation
    print("Getting the file translated...")
    s_translated = get_translation(s, lang)

    try: 
        s_translated = json.loads(s_translated)['translatedText']
    except KeyError:
        print("Invalid languages.")

    print(s_translated)


    # Copy the content in traduction.txt
    print("Copy the content of the file traducted to traduction.txt")
    with open('src/tmp/traduction.txt', 'wt') as f:
        f.write(s_translated)

    # Convert the traduction to JSON
    convert_to_json()
    
    # Write it from temp files to the lang json
    with open(f'src/lang/text/{lang}.json', 'w') as lang_json:
        with open("src/tmp/temp.json", 'r') as temp_json:
            # print(type(json.loads(temp_json.read())))
            # print(json.loads(temp_json.read()))
            # print(write_dic(json.loads(temp_json.read())))
            lang_json.write(write_dic(json.loads(temp_json.read())))

    

    



# print_file()
# convert_to_json()

languages = [
    # "ar",
    # "da",
    # "de",
    # "eo",
    # "en",
    # "es",
    # "fr",
    # "fi",
    # "id",
    # "it",
    # "ja",
    # "ko",
    # "nl",
    "no",
    "pl",
    "pt",
    "ru",
    "sv",
    "th",
    "tr",
    "uk",
    "vi",
    "zh"
]



if __name__ == '__main__':

    # for language in languages:
    #     total(language)

    convert_to_json()