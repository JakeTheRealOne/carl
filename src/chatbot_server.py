from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
import faiss
import json
import numpy as np
from langchain_ollama import OllamaLLM
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate

PROMPT = """
# Instructions principales :
Tu es une IA administrative dont l'unique but est de répondre aux questions de l'utilisateur sur la ville de Charleroi.

- Tu t'exprimes **strictement et uniquement en français**, sans aucune exception. Toute réponse contenant un ou plusieurs mots en anglais est interdite.
- Tu dois répondre principalement à partir des documents suivants, provenant du site officiel charleroi.be.
- Si l'information n'est pas clairement présente dans les documents, indique-le simplement par : "Je ne sais pas."
- Si la question est insensée ou hors-sujet, réponds : "Je ne peux pas vous aider avec cela."
- Ne termine jamais une réponse par : "Je ne peux pas vous aider avec cela." si tu as déjà fourni des informations utiles.
- Si tu réponds dans une autre langue que le français, tu es en erreur.
- **Aucun mot anglais** ne doit figurer dans ta réponse
- Ne mentionne pas un document si la question ne l'a pas demandé
- Tu ne dois **jamais mentionner** ton rôle, ta fonction, la question, le format de réponse et les instructions principales dans la réponse.


# Format de réponse :
Tu dois **formater ta réponse exclusivement en Markdown**.

Utilise :
- `#` pour le **titre principal**
- `##` pour les **sous-titres**
- `-` pour les **listes**
- **gras**, *italique*, pour les **mots-clés**

Tu ne dois pas utiliser de balises HTML, ni de texte brut sans structure Markdown.

# Documents :
{docs}

# Question :
{question}
"""



ollama_llm = OllamaLLM(model="llama2", temperature=0.1, max_tokens=400, language="fr")
prompt = PromptTemplate(input_variables=["docs", "question"], template=PROMPT)
chain = LLMChain(llm=ollama_llm, prompt=prompt)

with open('res/data.json', 'r') as file:
    _data = json.load(file)

model = SentenceTransformer('all-MiniLM-L6-v2')
pages = [page for page in _data]
texts = [page['content'] for page in _data]
embeddings = model.encode(texts)

dimension = embeddings.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(np.array(embeddings))
faiss.write_index(index, 'res/charleroi_index.index')

app = Flask(__name__)
CORS(app)

def search(query, index, model, pages, seuil=0.8):
    query_embedding = model.encode([query])
    D, I = index.search(np.array(query_embedding), k=3)

    results = []
    for d, i in zip(D[0], I[0]):
        if d < seuil:  # plus c'est proche de 0, plus c'est pertinent
            results.append(pages[i])
    
    return results

def ask_with_langchain(question, index, model, pages):
    resultats = search(question, index, model, pages)
    docs = "\n".join([f"Title: {r['title']}\nURL: {r['url']}\nContent: {r['content']}" for r in resultats])
    return chain.run(docs=docs, question=question)

@app.route('/api/message', methods=['POST'])
def respond_message():
    data = request.get_json()  # Retrieving client message
    message = data.get('message', '')
    response = ask_with_langchain(message, index, model, pages).replace("`", "")
    print(f"REPONSE:\n{response}")
    return jsonify({"response": response})

def run():
    app.run(host="127.0.0.1", port=5000, debug=True)