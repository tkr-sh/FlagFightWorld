import json
import os


# Return the dictionnary in a good string for a file
def write_dic(dic: dict[str, str]) -> str:

    """ Return the dictionnary in a good string for a file"""


    QUOTE = '"'
    SLASHQUOTE = '\\"'

    s = "{\n\t"
    s += ",\n\t".join(f'"{k.replace(QUOTE, SLASHQUOTE)}": "{v.replace(QUOTE, SLASHQUOTE)}"'for k,v in dic.items())
    s += "\n}"
    return s


# Main 
if __name__ == '__main__':
    with open("src/utils/languages.json", 'r') as f:
        for lang in json.loads(f.read()):
            dic_lang = {}

            # Adding country translation
            try:
                with open(f"src/lang/{lang}.json", 'r+') as country_traduction:
                    for k,v in json.loads(country_traduction.read()).items():
                        dic_lang[k] = v
            except FileNotFoundError:
                print(f"No traduction file for {lang}")

            # Adding basic text translation
            try:
                with open(f"src/lang/text/{lang}.json", 'r+') as text_traduction:
                    for k,v in json.loads(text_traduction.read()).items():
                        dic_lang[k] = v
            except FileNotFoundError:
                print(f"No traduction file for {lang}")

            # Writing this in the file with all the translation
            if not os.path.isdir(f'public/locales/{lang}/'):
                os.mkdir(f'public/locales/{lang}/')

            
            translation = open(f"public/locales/{lang}/translation.json", "w+")
            translation.write(write_dic(dic_lang))
            translation.close()