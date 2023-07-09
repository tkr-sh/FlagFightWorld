from requests import post


def get_translation(txt, to_lang):



  req = post("http://localhost:3000/translate", data={
    "q": txt,
		"source": "en",
		"target": to_lang,
		"format": "text",
		"api_key": ""
  });

  print(req)


  return req.text



print(get_translation("Hello, how are you DOING ?", "fr"))