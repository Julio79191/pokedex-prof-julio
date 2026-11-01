// ============================================================================
//  BACK-END DA POKÉDEX  —  o "porteiro" que guarda as chaves da IA
// ============================================================================
//  PARA QUE ISSO EXISTE (em uma frase):
//  para a chave da API Gemini NUNCA aparecer no navegador do aluno.
//
//  COMO FUNCIONA: este arquivo NÃO roda no celular do aluno. Ele roda no
//  servidor do Vercel. Quando o app (index.html) precisa identificar uma foto,
//  ele manda a foto para cá (/api/identificar). Aqui o back-end:
//    1) confere a foto com o porteiro do grupo (Missão 4);
//    2) monta o pedido para a IA com o especialista e o alvo do grupo
//       (Missões 1 e 2);
//    3) anexa uma das chaves (guardadas no Vercel, nunca no código) e fala
//       com o Google;
//    4) decide se a IA teve certeza suficiente (Missão 3) e escreve a
//       mensagem do grupo (Missões 5 e 6);
//    5) devolve tudo para o app desenhar a ficha.
//
//  UM PROJETO POR PROFESSOR, UMA PASTA POR GRUPO:
//    grupos/<apelido-do-grupo>/index.html ... o front do grupo
//    grupos/<apelido-do-grupo>/missoes.js ... as 6 missões do grupo
//  O front avisa de qual grupo é (campo "grupo"), e este arquivo carrega as
//  missões daquela pasta. Este arquivo é igual para todos e ninguém precisa
//  mexer nele. (Se não existir a pasta grupos/, ele usa o api/_missoes.js,
//  o jeito antigo de um projeto por grupo.)
//
//  "serverless" quer dizer que não precisamos manter um servidor ligado: o
//  Vercel executa esta função sozinho, só quando alguém chama o endereço.
//
//  ---------------------------------------------------------------------------
//  VÁRIAS CHAVES, COM REVEZAMENTO E TROCA AUTOMÁTICA
//  ---------------------------------------------------------------------------
//  O plano gratuito do Gemini tem cota curta e ela é contada POR PROJETO do
//  Google Cloud (não por chave!). Duas chaves do MESMO projeto dividem a MESMA
//  cota — não adianta nada. Duas chaves de PROJETOS DIFERENTES têm cotas
//  separadas, e é isso que este arquivo aproveita: você configura várias
//  chaves (uma de cada projeto) e, quando uma bate no limite, ele passa
//  sozinho para a próxima. Ver o GUIA-PROFESSORES.md.
//
//  Onde colocar as chaves (no Vercel → Settings → Environment Variables):
//    - GEMINI_API_KEY ......... a principal. Pode conter VÁRIAS chaves
//                               separadas por vírgula (o jeito mais prático
//                               para muitos projetos: uma variável só).
//    - GEMINI_API_KEY_2 ....... a segunda (reserva)
//    - GEMINI_API_KEY_3 ....... a terceira… e assim por diante, até _10.
//  Configurar só a GEMINI_API_KEY continua funcionando exatamente como antes.
//
//  DIAGNÓSTICO: abrir https://SEU-PROJETO.vercel.app/api/identificar no
//  navegador mostra TODOS os grupos (missões certas ou com erro) e quantas
//  chaves o servidor enxerga (só a quantidade, nunca o valor).
//  Um grupo só: .../api/identificar?grupo=apelido-do-grupo
const fs = require("fs");
const path = require("path");
const MODELO_VALIDO = /^[a-zA-Z0-9.\-]+$/;
const GRUPO_VALIDO = /^[a-z0-9][a-z0-9-]{0,80}$/;

/* Onde ficam as pastas dos grupos. No Vercel, o vercel.json manda incluir os
   missoes.js junto com esta função (includeFiles). */
function pastaGrupos() {
  const candidatas = [path.join(__dirname, "..", "grupos"), path.join(process.cwd(), "grupos")];
  return candidatas.find(p => fs.existsSync(p)) || null;
}

//  Qual modelo usar. Se existir a variável GEMINI_MODELO no Vercel, ela manda
//  (assim dá para trocar o modelo de um projeto sem mexer no código, por
//  exemplo quando o Google aposenta um). Senão, vale o que o app pediu.
const MODELO_FIXO = (process.env.GEMINI_MODELO || "").trim();
const MODELO_PADRAO = MODELO_FIXO || "gemini-3.6-flash";

//  Modelo de reserva: usado como última cartada em DOIS casos —
//   (1) todas as chaves estouraram a cota do modelo pedido (a cota é contada
//       por modelo, então o reserva tem contador próprio);
//   (2) o modelo pedido foi APOSENTADO pelo Google (erro 404 "no longer
//       available"). Isso acontece de tempos em tempos, e sem esta rede de
//       proteção o app quebraria no meio da aula. Ele continua funcionando
//       com o reserva enquanto o instrutor não atualiza o nome no index.html.
//  Para desligar, crie a variável GEMINI_MODELO_RESERVA vazia no Vercel.
const MODELO_RESERVA = process.env.GEMINI_MODELO_RESERVA !== undefined
  ? process.env.GEMINI_MODELO_RESERVA.trim()
  : "gemini-3.5-flash-lite";

// Status que significam "essa chave não pode agora, tente outra":
//   429 = estourou a cota / muitas requisições
//   403 = chave sem permissão (API não ativada naquele projeto, chave restrita)
//   400 = chave inválida (digitada errada, com espaço no meio…)
// Os três valem a pena tentar na chave seguinte, porque o problema é DAQUELA
// chave, não do pedido em si.
const TROCAR_DE_CHAVE = [400, 403, 429];
// Estes aqui são instabilidade do lado do Google: não adianta trocar de chave,
// mas vale esperar um instante e insistir.
const INSTABILIDADE = [500, 502, 503, 504];

/* carregarMissoes(grupo): lê o missoes.js do grupo e confere se ele está
   inteiro. Devolve as missões e uma lista de problemas em português. Se o
   arquivo tiver um erro de digitação (aspas curvas, parêntese faltando…), o
   require falha, e em vez de derrubar o site nós explicamos o que houve. */
function carregarMissoes(grupo) {
  let m;
  const raiz = pastaGrupos();
  let arquivo = path.join(__dirname, "_missoes.js");
  if (raiz) {
    if (!grupo) return { missoes: null, problemas: ["O app não disse de qual grupo é a foto."] };
    if (!GRUPO_VALIDO.test(grupo)) return { missoes: null, problemas: ["Nome de grupo inválido."] };
    arquivo = path.join(raiz, grupo, "missoes.js");
    if (!fs.existsSync(arquivo)) return { missoes: null, problemas: [`Não achei a pasta grupos/${grupo}/missoes.js.`] };
  }
  try {
    m = require(arquivo);
  } catch (e) {
    const dica = /Invalid or unexpected token|Unexpected identifier|Unexpected string/.test(e.message)
      ? " Dica: confira se todas as aspas são retas (\") e se nenhuma ficou faltando."
      : / is not defined/.test(e.message)
        ? " Dica: confira se os nomes em MAIÚSCULAS estão escritos igualzinho ao modelo."
        : "";
    return { missoes: null, problemas: [`O arquivo ${raiz ? "grupos/" + grupo + "/missoes.js" : "api/_missoes.js"} tem um erro de digitação: ${e.message}.${dica}`] };
  }

  const problemas = [];
  const sobrou = v => typeof v === "string" && /_{3,}|(\\_){3,}/.test(v);
  const texto = (nome, v) => {
    if (typeof v !== "string" || !v.trim()) problemas.push(`${nome} precisa ser um texto entre aspas.`);
    else if (sobrou(v)) problemas.push(`${nome} ainda tem ____ para preencher.`);
  };
  texto("Missão 1 (ESPECIALISTA)", m.ESPECIALISTA);
  texto("Missão 2 (O_QUE_PROCURAR)", m.O_QUE_PROCURAR);
  if (typeof m.CERTEZA_MINIMA !== "number" || m.CERTEZA_MINIMA < 0 || m.CERTEZA_MINIMA > 100) {
    problemas.push("Missão 3 (CERTEZA_MINIMA) precisa ser um número de 0 a 100, sem aspas.");
  }

  // As funções a gente testa de verdade, com exemplos, para pegar erro de
  // nome (r.nome_popular escrito diferente, por exemplo) antes da aula.
  const testar = (nome, fn, ...args) => {
    if (typeof fn !== "function") { problemas.push(`${nome} sumiu do arquivo.`); return; }
    try {
      const v = fn(...args);
      if (typeof v !== "string" || !v.trim()) problemas.push(`${nome} precisa devolver um texto (return "...").`);
      else if (sobrou(v)) problemas.push(`${nome} ainda tem ____ para preencher.`);
      else if (/undefined/.test(v)) problemas.push(`${nome} mostra "undefined": confira se o nome depois de r. está escrito igual ao modelo.`);
    } catch (e) {
      problemas.push(`${nome} deu erro ao rodar: ${e.message}`);
    }
  };
  testar("Missão 4 (conferirFoto, foto boa)", m.conferirFoto, { type: "image/jpeg", size: 1000 });
  testar("Missão 4 (conferirFoto, não é foto)", m.conferirFoto, { type: "application/pdf", size: 1000 });
  testar("Missão 4 (conferirFoto, foto grande)", m.conferirFoto, { type: "image/jpeg", size: 20000000 });
  testar("Missão 5 (mensagemDeDuvida)", m.mensagemDeDuvida, { confianca: 42, nome_popular: "Ipê-amarelo" });
  testar("Missão 6 (mensagemDeAcerto)", m.mensagemDeAcerto, { confianca: 95, nome_popular: "Ipê-amarelo" });
  if (typeof m.conferirFoto === "function") {
    try {
      if (m.conferirFoto({ type: "image/jpeg", size: 1000 }) !== "ok") problemas.push('Missão 4: uma foto boa precisa receber "ok" (o return "ok" fica igual).');
      if (m.conferirFoto({ type: "application/pdf", size: 1000 }) === "ok") problemas.push("Missão 4: um arquivo que não é foto está passando pelo porteiro.");
    } catch (e) { /* o erro já foi anotado em testar() */ }
  }

  return { missoes: m, problemas };
}

/* lerChaves(): junta todas as chaves configuradas numa lista só.
   - aceita GEMINI_API_KEY, GEMINI_API_KEY_2 … GEMINI_API_KEY_10;
   - aceita várias chaves numa mesma variável, separadas por vírgula, ponto e
     vírgula, espaço ou quebra de linha;
   - descarta repetidas e vazias (erro comum: colar a mesma chave duas vezes). */
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

/* De qual chave começar. Este número vive na memória do servidor entre um
   pedido e outro (enquanto a função está "quente") e anda de um em um. Serve
   para ESPALHAR o uso: o 1º aluno começa pela chave 1, o 2º pela chave 2, e
   assim por diante. Sem isso, a chave 1 gastaria toda a cota sozinha antes de
   a chave 2 ser usada uma única vez. */
let proximoInicio = 0;

/* chamarGoogle(): faz UMA tentativa — uma chave, um modelo. Devolve a resposta
   crua do Google (ou um "erro de rede" disfarçado de resposta 503, para o
   código de cima não quebrar se a internet do servidor falhar). */
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
    return { status: 503, data: { error: { message: "Não foi possível falar com o Google agora." } } };
  }
}

/* A FICHA PADRÃO (comum/ficha.js) precisa destes campos em TODO grupo: nome,
   curiosidades, biomas e regiões (para o mapa) e o habitat (para a cena).
   REGRAS_FICHA explica cada um para a IA; CAMPOS_FICHA é o formato. */
/* Separar "não é do tema" (ex.: melancia num app de flores) de "é do tema,
   mas a foto está ruim" (borrada, longe, escura). */
const regrasTema = alvo => `
- Em "e_do_tema", responda true se a foto mostra ${alvo} (mesmo que borrada, escura ou de longe) e false se mostra claramente outra coisa.
- Em "o_que_e", diga em poucas palavras, com artigo, o que aparece na foto (ex.: "uma melancia", "um cachorro", "uma rosa").
- Se a foto está ruim (borrada, escura, longe) mas parece ${alvo}, use "e_do_tema": true e uma "confianca" baixa.`;
const REGRAS_FICHA = `
- Responda sempre em português do Brasil.
- O nome científico deve ser preciso.
- Em "curiosidades", traga 3 curiosidades verdadeiras, específicas e interessantes — nada genérico.
- Em "status_conservacao", use a categoria da IUCN em português (ex.: Pouco preocupante, Vulnerável, Em perigo).
- Em "biomas", liste APENAS os biomas brasileiros onde a espécie ocorre, escolhendo de: "Amazônia", "Cerrado", "Mata Atlântica", "Caatinga", "Pampa", "Pantanal". O primeiro item da lista deve ser o bioma PRINCIPAL (mais associado à espécie). Se for uma espécie cultivada, liste os biomas onde ela é mais cultivada.
- Em "regioes", liste estados ou regiões brasileiras de ocorrência (ex.: "Norte do Pará", "Mata Atlântica do Sul da Bahia").
- Em "habitat_descricao", descreva em 2-3 frases ricas o ambiente onde a espécie vive.
- Em "cenario_tipo", escolha UM de: "floresta_amazonica","mata_atlantica","cerrado","caatinga","pampa","pantanal","rio","manguezal","urbano","plantacao".
- Em "cenario_periodo", escolha UM de: "dia","amanhecer","crepusculo","noite".
- Em "elementos_cenario", liste 4-7 elementos visuais característicos do ambiente.
- Em "companheiros_habitat", liste 3-5 espécies (animais ou plantas) que dividem o habitat com a identificada.
- Em "curiosidade_habitat", traga UMA curiosidade marcante sobre como ela usa/depende do habitat.`;
const CAMPOS_FICHA = {
  identificado: { type: "boolean" }, confianca: { type: "integer" },
  e_do_tema: { type: "boolean" }, o_que_e: { type: "string" },
  nome_popular: { type: "string" }, nome_cientifico: { type: "string" },
  status_conservacao: { type: "string" }, curiosidades: { type: "array", items: { type: "string" } },
  especies_parecidas: { type: "array", items: { type: "string" } }, mensagem: { type: "string" },
  biomas: { type: "array", items: { type: "string" } },
  regioes: { type: "array", items: { type: "string" } },
  habitat_descricao: { type: "string" },
  cenario_tipo: { type: "string" },
  cenario_periodo: { type: "string" },
  elementos_cenario: { type: "array", items: { type: "string" } },
  companheiros_habitat: { type: "array", items: { type: "string" } },
  curiosidade_habitat: { type: "string" }
};

/* montarPedido(): o "prompt" (as instruções para a IA) + a foto + o formato
   fixo da resposta. Usa as Missões 1 e 2 do grupo. */
function montarPedido(missoes, imagem, mime, aviso) {
  let prompt =
`Você é ${missoes.ESPECIALISTA}. Analise a imagem e identifique a ${missoes.O_QUE_PROCURAR} presente nela.

Regras:
- Em "confianca", dê um número de 0 a 100 dizendo o quanto você tem certeza da identificação. Seja honesto: foto borrada, distante ou ambígua merece número baixo.
- Se a imagem claramente não contém uma ${missoes.O_QUE_PROCURAR}, defina "identificado" como false e explique de forma gentil no campo "mensagem".` + regrasTema(missoes.O_QUE_PROCURAR) + REGRAS_FICHA;
  if (aviso) prompt += `\n- Inclua naturalmente este aviso de segurança em uma das curiosidades: "${aviso}"`;

  return {
    contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mime, data: imagem } }] }],
    generationConfig: {
      temperature: 0.2, responseMimeType: "application/json",
      responseSchema: { type: "object", properties: CAMPOS_FICHA, required: Object.keys(CAMPOS_FICHA) }
    }
  };
}

/* personalizarPedido(): o front do grupo já tem o SEU pedido (o prompt e o
   formato de resposta que a ficha dele usa: nome, luz, água…). Mantemos tudo
   isso e acrescentamos as Missões 1 e 2 (quem a IA finge ser e o que
   procurar) e os campos da ficha padrão (mapa, habitat…), sem apagar os
   campos que o grupo inventou. */
function personalizarPedido(missoes, original, aviso) {
  const body = JSON.parse(JSON.stringify(original));
  const partes = body?.contents?.[0]?.parts || [];
  const texto = partes.find(p => typeof p.text === "string");
  // Front que pede a resposta em TEXTO LIVRE (sem formato JSON): pedimos o
  // JSON da ficha e, num campo à parte (texto_front), o texto que o front lê.
  const textoLivre = !(body.generationConfig && body.generationConfig.responseSchema);
  const extra =
    `Você é ${missoes.ESPECIALISTA}. Procure na foto: ${missoes.O_QUE_PROCURAR}.\n` +
    `Em "confianca", dê um número de 0 a 100 dizendo o quanto você tem certeza; seja honesto. ` +
    `Em "nome_popular", escreva o nome popular em português do que você identificou. ` +
    `Se a foto não mostra ${missoes.O_QUE_PROCURAR}, use "identificado": false.` +
    `\nAlém dos campos pedidos abaixo, preencha também:` + regrasTema(missoes.O_QUE_PROCURAR) + REGRAS_FICHA +
    (aviso ? `\nInclua este aviso de segurança na resposta: "${aviso}"` : "") +
    (textoLivre ? `\nResponda em JSON. No campo "texto_front", escreva a resposta em texto corrido, do jeito que as instruções do grupo abaixo pedem.` : "");
  if (texto) texto.text = extra + "\n\n" + texto.text;
  else partes.unshift({ text: extra });

  const cfg = body.generationConfig = body.generationConfig || {};
  if (textoLivre) {
    cfg.responseMimeType = "application/json";
    cfg.responseSchema = { type: "object", properties: { texto_front: { type: "string" } }, required: ["texto_front"] };
  }
  const schema = cfg.responseSchema;
  if (schema && schema.type === "object") {
    // Campos que o grupo já definiu ficam do jeito dele (ex.: curiosidades
    // como texto); os que faltam entram no formato padrão.
    schema.properties = Object.assign({}, CAMPOS_FICHA, schema.properties || {});
    schema.required = Array.from(new Set([...(schema.required || []), ...Object.keys(CAMPOS_FICHA)]));
  }
  return body;
}

/* lerFotoDoPedido(): o app novo manda { imagem, mime, tipo, tamanho }:
   "tipo" e "tamanho" são do arquivo ORIGINAL que o aluno escolheu (é isso que
   o porteiro confere); "imagem" e "mime" são a foto já reduzida pelo app, que
   vai para a IA. Um front antigo (de antes das missões) manda { modelo, body }
   com a foto lá dentro. Aceitamos os dois, para nenhum projeto quebrar. */
function lerFotoDoPedido(pedido) {
  if (pedido.mime) {
    const imagem = typeof pedido.imagem === "string" ? pedido.imagem : "";
    const mime = String(pedido.mime);
    const tamanho = Number(pedido.tamanho) || Math.floor(imagem.length * 3 / 4);
    return { imagem, mime, tipo: String(pedido.tipo || mime), tamanho };
  }
  const partes = pedido.body?.contents?.[0]?.parts || [];
  const foto = partes.find(p => p.inline_data || p.inlineData);
  const dados = foto ? (foto.inline_data || foto.inlineData) : null;
  if (!dados && !pedido.tipo) return null;
  const imagem = dados ? String(dados.data || "") : "";
  const mime = dados ? String(dados.mime_type || dados.mimeType || "") : "";
  const tamanho = Number(pedido.tamanho) || Math.floor(imagem.length * 3 / 4);
  return { imagem, mime, tipo: String(pedido.tipo || mime), tamanho };
}

// req = o pedido que chega do app; res = a resposta que devolvemos a ele.
/* painelDosGrupos(): o GET sem grupo. Uma linha por pasta em grupos/, com o
   tema e o que falta arrumar. É a "lista de chamada" do professor. */
function painelDosGrupos(chaves) {
  const raiz = pastaGrupos();
  const grupos = raiz
    ? fs.readdirSync(raiz, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name).sort()
    : [];
  const lista = grupos.map(slug => {
    const { missoes, problemas } = carregarMissoes(slug);
    const info = (missoes && missoes.GRUPO) || {};
    return {
      grupo: slug,
      link: `/grupos/${slug}/`,
      nome: info.nome || slug,
      escola: info.escola, turma: info.turma, integrantes: info.integrantes,
      pendencias: info.pendencias && info.pendencias.length ? info.pendencias : undefined,
      procurar: missoes ? missoes.O_QUE_PROCURAR : undefined,
      tudo_certo: problemas.length === 0,
      problemas: problemas.length ? problemas : undefined
    };
  });
  return {
    chaves_configuradas: chaves.length,
    chaves: chaves.length ? `✅ O servidor enxerga ${chaves.length} chave(s).` : "❌ Nenhuma chave. Crie a GEMINI_API_KEY no Vercel e faça Redeploy.",
    modelo: MODELO_PADRAO,
    modelo_reserva: MODELO_RESERVA || "(desligado)",
    grupos_ok: lista.filter(g => g.tudo_certo).length,
    grupos_total: lista.length,
    grupos: lista
  };
}

module.exports = async (req, res) => {
  const chaves = lerChaves();
  const pedido = req.body || {};
  const grupo = String((req.query && req.query.grupo) || pedido.grupo || "").trim().toLowerCase();

  // 0a) GET sem grupo, num projeto com pasta grupos/: o painel de todos.
  if (req.method === "GET" && !grupo && pastaGrupos()) {
    res.status(200).json(painelDosGrupos(chaves));
    return;
  }

  const { missoes, problemas } = carregarMissoes(grupo);

  // 0b) GET = o professor abriu o endereço no navegador para conferir.
  if (req.method === "GET") {
    res.status(200).json({
      tudo_certo: problemas.length === 0 && chaves.length > 0,
      missoes: problemas.length ? problemas : "✅ As 6 missões estão preenchidas.",
      tema: missoes && !problemas.length ? { especialista: missoes.ESPECIALISTA, procurar: missoes.O_QUE_PROCURAR, certeza_minima: missoes.CERTEZA_MINIMA } : undefined,
      chaves_configuradas: chaves.length,
      chaves: chaves.length ? `✅ O servidor enxerga ${chaves.length} chave(s).` : "❌ Nenhuma chave. Crie a GEMINI_API_KEY no Vercel e faça Redeploy.",
      modelo: MODELO_PADRAO,
      modelo_reserva: MODELO_RESERVA || "(desligado)"
    });
    return;
  }

  // 1) Fora o GET de conferência, só aceitamos POST (o jeito de enviar dados).
  if (req.method !== "POST") {
    res.status(405).json({ error: { message: "Método não permitido." } });
    return;
  }

  // 2) Missões com erro: avisamos com clareza em vez de mandar lixo para a IA.
  if (problemas.length) {
    res.status(500).json({ problema_missoes: true, error: { message: "O back-end do grupo tem um problema: " + problemas.join(" ") } });
    return;
  }

  // 3) Pegamos as chaves guardadas no servidor. Se nenhuma foi configurada no
  //    Vercel, avisamos com clareza (erro comum na primeira vez).
  if (chaves.length === 0) {
    res.status(500).json({ error: { message: "GEMINI_API_KEY não configurada no servidor." } });
    return;
  }

  // 4) Lemos a foto e passamos pelo PORTEIRO do grupo (Missão 4).
  const foto = lerFotoDoPedido(pedido);
  if (!foto) {
    res.status(400).json({ error: { message: "Requisição inválida." } });
    return;
  }
  const veredito = missoes.conferirFoto({ type: foto.tipo, size: foto.tamanho });
  if (veredito !== "ok") {
    // 422 = "entendi o pedido, mas não aceito". O app mostra a mensagem do grupo.
    res.status(422).json({ porteiro: true, error: { message: String(veredito) } });
    return;
  }
  if (!foto.imagem) {
    res.status(400).json({ error: { message: "A foto não chegou ao servidor. Tente de novo." } });
    return;
  }

  const modelo = MODELO_FIXO || pedido.modelo || MODELO_PADRAO;
  if (!MODELO_VALIDO.test(modelo)) {
    res.status(400).json({ error: { message: "Requisição inválida." } });
    return;
  }
  const aviso = typeof pedido.aviso === "string" ? pedido.aviso.slice(0, 300) : "";
  // Front com pedido próprio (formato da ficha dele): só acrescentamos as
  // missões. Front sem pedido próprio: montamos o pedido completo.
  const body = pedido.body
    ? personalizarPedido(missoes, pedido.body, aviso)
    : montarPedido(missoes, foto.imagem, foto.mime, aviso);

  // 5) Montamos a ORDEM das tentativas:
  //    primeiro o modelo pedido em TODAS as chaves (começando por uma
  //    diferente a cada pedido, para espalhar o uso); e, se tudo falhar por
  //    cota, o modelo de reserva em todas as chaves de novo.
  const modelos = [modelo];
  if (MODELO_RESERVA && MODELO_RESERVA !== modelo) modelos.push(MODELO_RESERVA);
  const inicio = proximoInicio++ % chaves.length;

  let ultima = null;          // a última resposta ruim, para devolver ao app
  let houveCotaEstourada = false;  // alguma chave respondeu 429?
  let modeloAposentado = false;    // o modelo pedido não existe mais (404)?
  let instavel = false;            // o Google respondeu "sobrecarregado" (503…)?

  for (const modeloAtual of modelos) {
    let insistencias = 0;          // quantas vezes já esperamos neste modelo
    for (let i = 0; i < chaves.length; i++) {
      // O "% chaves.length" faz a lista dar a volta: se começamos na chave 2 de
      // 3, a ordem vira 2 → 3 → 1. Todas são tentadas, só que em outra ordem.
      const indice = (inicio + i) % chaves.length;
      const r = await chamarGoogle(modeloAtual, chaves[indice], body);

      if (r.status >= 200 && r.status < 300) {
        // Deu certo. Estes dois cabeçalhos são só para DIAGNÓSTICO do
        // instrutor (aparecem na aba Network do navegador): dizem qual chave
        // (pelo número, nunca o valor!) e qual modelo responderam.
        res.setHeader("X-Chave-Usada", String(indice + 1));
        res.setHeader("X-Modelo-Usado", modeloAtual);
        res.status(200).json(aplicarMissoes(missoes, r.data));
        return;
      }

      ultima = r;
      if (r.status === 429) houveCotaEstourada = true;
      // 404 = o modelo não existe (ou foi aposentado). Não adianta tentar as
      // outras chaves: o problema é o MODELO, não a chave. Saímos do laço das
      // chaves para ir direto ao modelo de reserva.
      if (r.status === 404) { modeloAposentado = true; break; }
      // Se o problema NÃO é da chave (ex.: instabilidade do Google, ou a foto
      // veio malformada), trocar de chave não resolve — paramos por aqui e
      // devolvemos o erro. O app tem o seu próprio "tentar de novo".
      // Google sobrecarregado ("high demand"): esperamos um pouco e tentamos
      // de novo (até 2 vezes); se continuar, vamos para o modelo de reserva,
      // que costuma estar mais livre.
      if (INSTABILIDADE.includes(r.status)) {
        instavel = true;
        if (insistencias++ < 2) {
          await new Promise(ok => setTimeout(ok, 1200 * insistencias));
          if (chaves.length === 1) i--;   // só uma chave: insiste nela mesma
          continue;
        }
        break;
      }
      if (!TROCAR_DE_CHAVE.includes(r.status)) {
        res.status(r.status).json(r.data);
        return;
      }
    }
    // Só vale a pena tentar o modelo de reserva se a barreira foi COTA (429),
    // MODELO APOSENTADO (404) ou SOBRECARGA (503). Se as chaves são inválidas,
    // o reserva falha igual.
    if (!houveCotaEstourada && !modeloAposentado && !instavel) break;
  }

  // 6) Chegou aqui: todas as tentativas falharam. Devolvemos o último erro do
  //    Google, mas acrescentamos uma frase que explica o quadro para quem está
  //    na sala (o app mostra esse "Detalhe" na tela de erro).
  const data = ultima ? ultima.data : {};
  if (houveCotaEstourada && chaves.length > 1 && data && data.error) {
    data.error.message =
      `Todas as ${chaves.length} chaves configuradas estão sem cota agora. ` +
      (data.error.message || "");
  }
  if (modeloAposentado && data && data.error) {
    data.error.message =
      `O modelo "${modelo}" não está mais disponível, e o reserva ` +
      `("${MODELO_RESERVA}") também falhou. Atualize a linha const MODELO no ` +
      `index.html com o modelo sugerido abaixo. ` + (data.error.message || "");
  }
  if (instavel && !houveCotaEstourada && !modeloAposentado && data && data.error) {
    data.error.message = "A IA do Google está sobrecarregada agora (muita gente usando). Espere uns segundos e tente de novo.";
  }
  res.setHeader("X-Chaves-Configuradas", String(chaves.length));
  res.status(ultima ? ultima.status : 503).json(data);
};

/* aplicarMissoes(): a IA respondeu. Três saídas possíveis:
   - NÃO É DO TEMA (ex.: melancia num app de flores): fora_do_tema = true e a
     mensagem automática "Não reconhecemos porque isso parece ser…";
   - É DO TEMA, mas abaixo da CERTEZA_MINIMA (Missão 3): "não identificado"
     com a mensagem de dúvida do grupo (Missão 5);
   - ACERTOU: a mensagem de acerto do grupo (Missão 6).
   Devolvemos no MESMO formato do Google (candidates…text), para o app antigo
   e o novo entenderem igual. */
function aplicarMissoes(missoes, data) {
  const parte = data?.candidates?.[0]?.content?.parts?.[0];
  if (!parte || typeof parte.text !== "string") return data;
  let r;
  try { r = JSON.parse(parte.text); } catch (e) { return data; }

  r.confianca = Number(r.confianca) || 0;
  r.certeza_minima = missoes.CERTEZA_MINIMA;
  // Cada front chama o nome de um jeito (nome, name…); a Missão 6 usa
  // r.nome_popular, então garantimos que ele exista.
  r.nome_popular = r.nome_popular || r.nome || r.name || "essa espécie";
  if (r.e_do_tema === false) {
    const oque = String(r.o_que_e || "outra coisa").trim();
    r.identificado = false;
    r.fora_do_tema = true;
    r.mensagem_backend = `🚫 Não reconhecemos porque isso parece ser ${oque}, e aqui a gente só reconhece ${missoes.O_QUE_PROCURAR}.`;
    r.mensagem = r.mensagem_backend;
  } else if (!r.identificado || r.confianca < missoes.CERTEZA_MINIMA) {
    // Às vezes a IA tem certeza de que é do tema ("é um réptil") mas não de
    // QUAL espécie; aí a confiança vem alta (95%) e a mensagem de dúvida
    // ficava sem sentido ("Estou em dúvida 95"). Na dúvida, o número mostrado
    // fica sempre abaixo da certeza mínima do grupo.
    if (r.confianca >= missoes.CERTEZA_MINIMA) r.confianca = Math.max(0, Math.min(r.confianca, missoes.CERTEZA_MINIMA - 10));
    r.identificado = false;
    r.mensagem_backend = String(missoes.mensagemDeDuvida(r));
    r.mensagem = r.mensagem_backend;
  } else {
    r.mensagem_backend = String(missoes.mensagemDeAcerto(r));
  }
  parte.text = JSON.stringify(r);
  return data;
}
