"""Monta grupos/<slug>/ a partir do front original do grupo.
Uso: python3 -I montar.py <repo> <slug> <html_original> <config.js> [substituicoes.json]
- copia o HTML do grupo para grupos/<slug>/index.html;
- aplica substituições pontuais (ex.: foto errada -> data-especie);
- cola, antes do </body>, a ficha padrão + o adaptador + a configuração."""
import base64
import io
import json
import os
import re
import sys

from PIL import Image


def otimizar(html, limite=350_000, lado=1600):
    """Imagens embutidas muito pesadas (PNG de vários MB) viram JPEG menores:
    a página abre bem mais rápido no tablet e a imagem continua nítida."""
    def troca(m):
        dados = base64.b64decode(m.group(2))
        if len(dados) < limite:
            return m.group(0)
        im = Image.open(io.BytesIO(dados))
        if im.mode in ("RGBA", "LA", "P") and "A" in im.convert("RGBA").getbands():
            alfa = im.convert("RGBA").getchannel("A")
            if alfa.getextrema()[0] < 250:      # tem transparência de verdade: mantém PNG
                return m.group(0)
        im = im.convert("RGB")
        im.thumbnail((lado, lado))
        out = io.BytesIO()
        im.save(out, "JPEG", quality=84, optimize=True, progressive=True)
        return "data:image/jpeg;base64," + base64.b64encode(out.getvalue()).decode()
    return re.sub(r"data:image/([a-z+]+);base64,([A-Za-z0-9+/=]+)", troca, html)

repo, slug, origem, config = sys.argv[1:5]
subs = json.load(open(sys.argv[5])) if len(sys.argv) > 5 else []
html = open(origem, encoding="utf-8").read()
for item in subs:
    velho, novo = item["de"], item["para"]
    qtd = item.get("qtd", 1)
    achou = html.count(velho)
    assert achou == qtd, f"esperava {qtd}x, achei {achou}x: {velho[:80]}"
    html = html.replace(velho, novo)
antes = len(html)
html = otimizar(html)
if len(html) < antes:
    print(f"imagens otimizadas: {antes // 1024} KB -> {len(html) // 1024} KB")
bloco = (
    "\n<!-- POKÉDEX: ficha padrão em pop-up + ligação com o back-end do grupo\n"
    "     (comum/ficha.js e comum/adaptador.js). O resto da página é do grupo. -->\n"
    '<script src="/comum/ficha.js"></script>\n'
    '<script src="/comum/adaptador.js"></script>\n'
    "<script>\n" + open(config, encoding="utf-8").read().strip() + "\n</script>\n"
)
i = html.lower().rfind("</body>")
html = html[:i] + bloco + html[i:] if i >= 0 else html + bloco
pasta = os.path.join(repo, "grupos", slug)
os.makedirs(pasta, exist_ok=True)
open(os.path.join(pasta, "index.html"), "w", encoding="utf-8").write(html)
print("ok", pasta, len(html) // 1024, "KB")
