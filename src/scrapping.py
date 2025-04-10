# Bilal Vandenberge

import requests
from bs4 import BeautifulSoup
import time
import re
import json
from tqdm import tqdm

CLIENT_WEBSITE = "https://www.charleroi.be"
SITE_MAP = CLIENT_WEBSITE + "/sitemap.xml"

def recursive_scrapping(url: str) -> None:
  output = []
  if url[-3:] == "xml":
    res = requests.get(url)
    soup = BeautifulSoup(res.content, "xml")
    urls = [loc.text for loc in soup.find_all("loc")]
    #print(url)
    for child in urls:
      if child != url:
        output.extend(recursive_scrapping(child))
  else:
    # print(url)
    output.append(url)
  return output

def extract_text(url):
    if "assets/images" in url:
      return ""
    html = requests.get(url).content
    soup = BeautifulSoup(html, "html.parser")

    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()

    return soup.get_text(separator="\n", strip=True)

def save_to_txt(pages: list[str]) -> None:
  with open("res/data.json", mode = "w+") as f:
    f.write("[\n")
    for page in tqdm(pages):
      # print(page)
      txt = extract_text(page)
      # print(txt)
      if not txt:
        continue

      if "Fermer la recherche" in txt:
        footer = txt.index("Fermer la recherche")
        txt = txt[:footer]
      txt = re.sub(r'^Photo .*\n', '', txt, flags=re.MULTILINE)
      txt = txt.replace("’", "'")
      title = txt.splitlines()[0]
      json_data = json.dumps({"title": title, "url": page, "content": txt}, ensure_ascii=False)
      f.write(f"  {json_data},\n")
    f.write("]\n")

pages = recursive_scrapping(SITE_MAP)
save_to_txt(pages)