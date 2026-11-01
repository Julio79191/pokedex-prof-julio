"""Lê o documento "Meu Back-End — Pokédex" (.docx) de um grupo e devolve as
missões em JSON. Uso: python3 -I extrair_missoes.py arquivo.docx"""
import json
import re
import sys
import zipfile
from html import unescape


def paragrafos(caminho):
    xml = zipfile.ZipFile(caminho).read("word/document.xml").decode("utf-8")
    saida = []
    for p in re.findall(r"<w:p[ >].*?</w:p>", xml, re.S):
        partes = re.findall(r"<w:t[^>]*>([^<]*)</w:t>|<w:(tab|br)/>", p)
        saida.append("".join(t if t else " " for t, _ in partes))
    celulas = []
    for tc in re.findall(r"<w:tc>.*?</w:tc>", xml, re.S):
        celulas.append(unescape("".join(re.findall(r"<w:t[^>]*>([^<]*)</w:t>", tc))).strip())
    return [unescape(x) for x in saida], celulas


def limpar(s):
    s = re.sub(r"[-​-‍﻿]", "", s)   # caracteres invisíveis do Docs
    s = s.replace("“", '"').replace("”", '"').replace("’", "'")
    s = re.sub(r"\\?_{2,}|(\\_)+", " ", s)   # sobras de ____
    s = re.sub(r"\s+", " ", s).strip()
    return s.strip(" _")


def achar(texto, padrao):
    m = re.search(padrao, texto, re.S)
    return limpar(m.group(1)) if m else None


def extrair(caminho):
    ps, celulas = paragrafos(caminho)
    texto = "\n".join(ps)
    q = r'["“”]'
    r = {}
    r["ESPECIALISTA"] = achar(texto, r"ESPECIALISTA\s*=\s*" + q + r"(.*?)" + q + r"\s*;")
    r["O_QUE_PROCURAR"] = achar(texto, r"O_QUE_PROCURAR\s*=\s*" + q + r"(.*?)" + q + r"\s*;")
    m = re.search(r"CERTEZA_MINIMA\s*=\s*" + q + r"?\s*_*\s*(\d+)", texto)
    r["CERTEZA_MINIMA"] = int(m.group(1)) if m else None
    r["por_que"] = achar(texto, r"Por que vocês escolheram esse número\?(.*?)\n")
    r["nao_foto"] = achar(texto, r"image/" + q + r"\)\)\s*return\s*" + q + r"(.*?)" + q + r"\s*;")
    r["grande"] = achar(texto, r"10000000\)\s*return\s*" + q + r"(.*?)" + q + r"\s*;")
    m = re.search(r"function mensagemDeDuvida\(r\)\s*\{\s*return\s*" + q + r"(.*?)" + q + r"\s*\+\s*r\.confianca\s*\+\s*" + q + r"(.*?)" + q + r"\s*;", texto, re.S)
    r["duvida"] = [limpar(m.group(1)), limpar(m.group(2))] if m else None
    m = re.search(r"function mensagemDeAcerto\(r\)\s*\{\s*return\s*" + q + r"(.*?)" + q + r"\s*\+\s*r\.nome_popular\s*\+\s*" + q + r"(.*?)" + q + r"\s*;", texto, re.S)
    r["acerto"] = [limpar(m.group(1)), limpar(m.group(2))] if m else None
    # tabela do grupo
    info = {}
    for i, c in enumerate(celulas[:-1]):
        for chave, rotulo in [("nome", "Nome do grupo"), ("integrantes", "Integrantes"), ("tema", "Tema da Pok"), ("digitando", "Quem está digitando")]:
            if c.startswith(rotulo):
                info[chave] = celulas[i + 1]
    r["grupo"] = info
    # trechos brutos, para revisar à mão quando algo não casar
    i = texto.find("Missão 1")
    j = texto.find("Antes de entregar")
    r["_bruto"] = texto[i:j] if i >= 0 else texto[:3000]
    return r


if __name__ == "__main__":
    print(json.dumps(extrair(sys.argv[1]), ensure_ascii=False, indent=1))
