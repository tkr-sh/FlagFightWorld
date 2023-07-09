file_loc = "src/assets/icons/reception-solid.svg"
file = open(file_loc, 'r+')


data = file.read()

new_data = ""
i = 0
while i < len(data):
    c = data[i]

    if c == ':' and data[i+1].isalpha():
        i += 1
        new_data += data[i].upper()
    else:
        new_data += c

    i += 1

file.truncate(0)
file.seek(0)
file.write(new_data)
file.close()