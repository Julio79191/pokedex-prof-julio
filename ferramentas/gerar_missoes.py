"""Gera grupos/<slug>/missoes.js a partir das missões extraídas do .docx.
Uso: python3 -I gerar_missoes.py <saida.js> <json_das_missoes> <json_de_ajustes>
Os ajustes (opcionais) sobrescrevem campos e registram observações para o
relatório (o que foi corrigido e por quê)."""
import json
import sys

saida, arq_missoes, arq_ajustes = sys.argv[1], sys.argv[2], sys.argv[3]
m = json.load(open(arq_missoes))
a = json.load(open(arq_ajustes))
for k, v in a.get("sobrescrever", {}).items():
    m[k] = v
# Missões que o grupo deixou em branco: o app funciona com a mensagem do
# exemplo do documento, e a pendência aparece no painel da professora.
PADRAO = {
    "nao_foto": ("📷 Isso não é uma foto!", "Missão 4 (mensagem de não é foto)"),
    "grande": ("🐘 Foto grande demais! Escolha outra.", "Missão 4 (mensagem de foto grande)"),
    "duvida": (["🤔 Tenho só", "% de certeza. Tenta outra foto, mais de perto!"], "Missão 5"),
    "acerto": (["🎉 Achei! É", "! Que demais!"], "Missão 6"),
}
pendencias = list(a.get("pendencias", []))
vazio = lambda v: (not v) or (isinstance(v, list) and not any(len(x.strip()) > 1 for x in v))
for campo, (padrao, nome) in PADRAO.items():
    if vazio(m.get(campo)):
        m[campo] = padrao
        pendencias.append(nome)
g = dict(m.get("grupo") or {})
g.update(a.get("grupo", {}))

js = lambda s: json.dumps(s, ensure_ascii=False)
def junta(p):  # "começo " + r.x + " fim", com espaço entre as partes
    ini, fim = [x.strip() for x in (p or ["", ""])]
    ini = ini + (" " if ini else "")
    fim = fim if (not fim or fim.startswith(("%", "!", "?", ".", ","))) else " " + fim
    return ini, fim

d_ini, d_fim = junta(m["duvida"])
a_ini, a_fim = junta(m["acerto"])
obs = a.get("observacoes", [])
if pendencias:
    obs = obs + ["Em branco no documento (usada a mensagem do exemplo; completar com o grupo): " + ", ".join(pendencias) + "."]
obs_txt = "".join(f"\n//   - {o}" for o in obs)

texto = f"""// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo
// ============================================================================
//  Cópia do documento "Meu Back-End — Pokédex" que o grupo preencheu. O resto
//  do back-end (as chaves da IA, o revezamento, a conversa com o Google) mora
//  em api/identificar.js e é igual para todos.
//
//  Para conferir se ficou certo depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo={a["slug"]}{("" if not obs else chr(10) + "//" + chr(10) + "//  Ajustes feitos pela professora (o resto é como o grupo escreveu):" + obs_txt)}
// ============================================================================

// Quem é o grupo (aparece no painel)
const GRUPO = {{
  nome: {js(g.get("nome") or a.get("nome_padrao", ""))},
  integrantes: {js(g.get("integrantes", ""))},
  escola: {js(a["escola"])},
  turma: {js(a["turma"])},
  tema: {js(g.get("tema", ""))}{("," + chr(10) + "  pendencias: " + js(pendencias)) if pendencias else ""}
}};

// Missão 1: quem a IA vai fingir ser
const ESPECIALISTA = {js(m["ESPECIALISTA"])};

// Missão 2: o que procurar na foto
const O_QUE_PROCURAR = {js(m["O_QUE_PROCURAR"])};

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: {js(m.get("por_que") or "")}
const CERTEZA_MINIMA = {int(m["CERTEZA_MINIMA"])};

// Missão 4: o porteiro
function conferirFoto(foto) {{
  if (!foto.type.startsWith("image/")) return {js(m["nao_foto"])};
  if (foto.size > 10000000) return {js(m["grande"])};
  return "ok";
}}

// Missão 5: quando a IA fica em dúvida
function mensagemDeDuvida(r) {{
  return {js(d_ini)} + r.confianca + {js(d_fim)};
}}

// Missão 6: quando a IA acerta
function mensagemDeAcerto(r) {{
  return {js(a_ini)} + r.nome_popular + {js(a_fim)};
}}

// ----------------------------------------------------------------------------
//  DAQUI PARA BAIXO, NÃO MEXA. Esta linha entrega as missões para o
//  api/identificar.js usar.
// ----------------------------------------------------------------------------
module.exports = {{ GRUPO, ESPECIALISTA, O_QUE_PROCURAR, CERTEZA_MINIMA, conferirFoto, mensagemDeDuvida, mensagemDeAcerto }};
"""
open(saida, "w").write(texto)
print("ok", saida)
