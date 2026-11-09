// ============================================================================
//  BACK-END DO CHAT DA POKÉDEX  —  /api/chat
// ============================================================================
//  Funciona igual ao identificar.js: roda no servidor do Vercel, usa as MESMAS
//  chaves (GEMINI_API_KEY, GEMINI_API_KEY_2 … _10) e a chave nunca aparece no
//  navegador do aluno.
//
//  O front (index.html do grupo) manda:    { "message": "pergunta do aluno", "tema": "flores" }
//  ("tema" é opcional: escolhe a personalidade da IA entre as que existem em
//   TEMAS, mais abaixo. Sem "tema", vale a da Amazônia.)
//  Este arquivo responde:                  { "resposta": "texto da IA" }
//  Em caso de erro responde:               { "erro": "o que aconteceu" }
//
//  Se este arquivo não existir ou falhar, o front continua funcionando com as
//  respostas locais (localChat), então nada quebra.
// ============================================================================

const MODELO_VALIDO = /^[a-zA-Z0-9.\-]+$/;

// Mesmos modelos do identificar.js (e as mesmas variáveis opcionais do Vercel).
const MODELO_PADRAO = (process.env.GEMINI_MODELO || "").trim() || "gemini-3.6-flash";
const MODELO_RESERVA = process.env.GEMINI_MODELO_RESERVA !== undefined
  ? process.env.GEMINI_MODELO_RESERVA.trim()
  : "gemini-3.5-flash-lite";

// Quem a IA "é" e o que ela pode responder, uma personalidade por tema.
// Cada grupo escolhe a sua mandando "tema" no pedido. Para criar outra, é só
// acrescentar mais uma entrada aqui (o nome é o que o front vai mandar).
const REGRAS_COMUNS = `
Regras:
- Responda sempre em português do Brasil, de forma simples, simpática e curta (no máximo 4 frases).
- Se a pergunta fugir do tema, diga com educação que você só conversa sobre ele e sugira uma pergunta sobre o tema.
- Se não tiver certeza de algo, diga que não tem certeza. Nunca invente dados.
- Não use formatação especial (sem asteriscos, sem listas longas): é texto simples para um balão de conversa.`;

const TEMAS = {
  amazonia: `Você é a IA da "Pokédex da Amazônia", uma assistente amigável para estudantes.
Fale somente sobre animais, plantas, habitats, rios, clima e conservação da Amazônia e da fauna e flora brasileiras.` + REGRAS_COMUNS,
  flores: `Você é o "Professor das Flores", o assistente amigável do app "Mundo das Flores" para estudantes.
Fale somente sobre flores, plantas ornamentais, jardinagem, pétalas, cores, perfumes, polinização, cuidados de cultivo e curiosidades do mundo das flores.` + REGRAS_COMUNS,
};
const TEMA_PADRAO = "amazonia";

const TAMANHO_MAXIMO = 500;      // caracteres da pergunta
const TROCAR_DE_CHAVE = [400, 403, 429];
const INSTABILIDADE = [500, 502, 503, 504];

/* Junta todas as chaves configuradas (igual ao identificar.js). */
function lerChaves() {
  const nomes = ["GEMINI_API_KEY"];
  for (let i = 2; i <= 10; i++) nomes.push("GEMINI_API_KEY_" + i);
  const chaves = [];
  for (const nome of nomes) {
    const bruto = process.env[nome];
    if (!bruto) continue;
    for (const chave of bruto.split(/[\s,;]+/)) {
      const limpa = chave.trim();
      if (limpa && !chaves.includes(limpa)) chaves.push(limpa);
    }
  }
  return chaves;
}

// Espalha o uso entre as chaves (cada pedido começa por uma chave diferente).
let proximoInicio = 0;

/* Uma tentativa: uma chave, um modelo. */
async function chamarGoogle(modelo, chave, body) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${chave}`;
  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await upstream.json().catch(() => ({}));
    return { status: upstream.status, data };
  } catch (e) {
    return { status: 503, data: {} };
  }
}

function lerTexto(data) {
  const partes = data?.candidates?.[0]?.content?.parts || [];
  return partes.map(p => (typeof p.text === "string" ? p.text : "")).join("").trim();
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ erro: "Método não permitido." });
    return;
  }

  // Pergunta do aluno (o front manda "message").
  let corpo = req.body || {};
  if (typeof corpo === "string") { try { corpo = JSON.parse(corpo); } catch (e) { corpo = {}; } }
  const pergunta = String(corpo.message || "").trim().slice(0, TAMANHO_MAXIMO);
  if (!pergunta) {
    res.status(400).json({ erro: "Escreva uma pergunta." });
    return;
  }

  const chaves = lerChaves();
  if (chaves.length === 0) {
    res.status(500).json({ erro: "GEMINI_API_KEY não configurada no servidor." });
    return;
  }
  if (!MODELO_VALIDO.test(MODELO_PADRAO)) {
    res.status(500).json({ erro: "Nome de modelo inválido no servidor." });
    return;
  }

  const tema = Object.prototype.hasOwnProperty.call(TEMAS, corpo.tema) ? corpo.tema : TEMA_PADRAO;
  const body = {
    systemInstruction: { parts: [{ text: TEMAS[tema] }] },
    contents: [{ role: "user", parts: [{ text: pergunta }] }],
    generationConfig: { temperature: 0.6, maxOutputTokens: 1024 },
  };

  // Mesma ordem de tentativas do identificar.js: modelo principal em todas as
  // chaves; se a cota acabar ou o modelo sumir, o modelo de reserva.
  const modelos = [MODELO_PADRAO];
  if (MODELO_RESERVA && MODELO_RESERVA !== MODELO_PADRAO && MODELO_VALIDO.test(MODELO_RESERVA)) {
    modelos.push(MODELO_RESERVA);
  }
  const inicio = proximoInicio++ % chaves.length;

  let ultimaStatus = 503;
  let houveCota = false, modeloAposentado = false, instavel = false;

  for (const modeloAtual of modelos) {
    let insistencias = 0;
    for (let i = 0; i < chaves.length; i++) {
      const indice = (inicio + i) % chaves.length;
      const r = await chamarGoogle(modeloAtual, chaves[indice], body);

      if (r.status >= 200 && r.status < 300) {
        const texto = lerTexto(r.data);
        if (!texto) {
          res.status(502).json({ erro: "A IA não devolveu texto. Tente reformular a pergunta." });
          return;
        }
        res.setHeader("X-Chave-Usada", String(indice + 1));   // só diagnóstico
        res.setHeader("X-Modelo-Usado", modeloAtual);
        res.status(200).json({ resposta: texto });
        return;
      }

      ultimaStatus = r.status;
      if (r.status === 429) houveCota = true;
      if (r.status === 404) { modeloAposentado = true; break; }
      if (INSTABILIDADE.includes(r.status)) {
        instavel = true;
        if (insistencias++ < 1) {
          await new Promise(ok => setTimeout(ok, 1000));
          if (chaves.length === 1) i--;
          continue;
        }
        break;
      }
      if (!TROCAR_DE_CHAVE.includes(r.status)) {
        res.status(502).json({ erro: "A IA não conseguiu responder agora." });
        return;
      }
    }
    if (!houveCota && !modeloAposentado && !instavel) break;
  }

  const erro = houveCota
    ? "A IA está com muitos pedidos agora. Espere alguns segundos e tente de novo."
    : "A IA não conseguiu responder agora. Tente de novo em instantes.";
  res.status(ultimaStatus >= 400 ? ultimaStatus : 503).json({ erro });
};
