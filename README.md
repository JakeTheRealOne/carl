# Carl - Agent administratif de Charleroi

## Description

Carl est un chatbot intelligent dont le but est de répondre aux questions des citoyens sur les démarches administratives, les contacts, les lieux et les infos en tout genre de la ville de Charleroi

## Contexte

Ce projet est issus du hackaton [CitizensOfWallonia](https://www.citizensofwallonia.be/) 2025

## Auteurs

L'équipe **Sigma Studios** est essentiellement composée de 3 étudiants de l'ULB:

| Nom         | Prénom | Mail                     |
|-------------|--------|--------------------------|
| Vandenberge | Bilal  | jakelevrai@outlook.be    |
| Dejean      | Romain | romaindejean22@gmail.com |
| Rocca       | Manuel | manuelrocca05@gmail.com  |

## Installer le serveur

Pour installer le LLM du serveur

```shell
ollama run llama2
```

Attention, ce modèle observe certaines [limitations materielles](https://ollama.com/library/llama2).


## Lancer le serveur

Pour lancer le serveur qui hébergera le LLM

```shell
ollama serve &
python3 src/main.py
```

## Lancer un client

La page web de Carl est disponible [ici](idea/index.html) 

## Dépendences

### LLM

- ollama

### Modules python3

- flask
- flask_cors
- sentence_transformers
- faiss
- numpy
- langchain_ollama
- langchain
