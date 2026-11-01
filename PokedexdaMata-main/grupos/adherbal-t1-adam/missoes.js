// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo
// ============================================================================
//  Cópia do documento "Meu Back-End — Pokédex" que o grupo preencheu. O resto
//  do back-end (as chaves da IA, o revezamento, a conversa com o Google) mora
//  em api/identificar.js e é igual para todos.
//
//  Para conferir se ficou certo depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo=adherbal-t1-adam
//
//  Ajustes feitos pela professora (o resto é como o grupo escreveu):
//   - Missões 1 e 2: o documento dizia "um ornitólogo especialista" e "aves do brasil", mas o tema e o site do grupo são de ÁRVORES; ajustado para árvores.
//   - Missão 3: estava 8 (provável erro de digitação); ficou 80.
//   - Escritas pela professora (estavam em branco ou incompletas no documento): Missão 4 (mensagem de não é foto), Missão 4 (mensagem de foto grande), Missão 5, Missão 6.
// ============================================================================

// Quem é o grupo (aparece no painel)
const GRUPO = {
  nome: "Bleach",
  integrantes: "Aysha, Adam e Alicia",
  escola: "Adherbal",
  turma: "Turma 1",
  tema: "Árvores nativas do Brasil"
};

// Missão 1: quem a IA vai fingir ser
const ESPECIALISTA = "um botânico especialista em árvores nativas do Brasil";

// Missão 2: o que procurar na foto
const O_QUE_PROCURAR = "árvore nativa do Brasil";

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: ""
const CERTEZA_MINIMA = 80;

// Missão 4: o porteiro
function conferirFoto(foto) {
  if (!foto.type.startsWith("image/")) return "🌳 Ei, shinigami! Isso não é uma foto! Mostre uma árvore pra gente.";
  if (foto.size > 10000000) return "🪵 Essa foto é mais pesada que um tronco de jequitibá! Escolha uma menor.";
  return "ok";
}

// Missão 5: quando a IA fica em dúvida
function mensagemDeDuvida(r) {
  return "🍃 Hmm… só tenho " + r.confianca + "% de certeza. Chegue mais perto das folhas e tente de novo!";
}

// Missão 6: quando a IA acerta
function mensagemDeAcerto(r) {
  return "🌳 Bankai! Essa árvore é " + r.nome_popular + "! Que incrível!";
}

// ----------------------------------------------------------------------------
//  DAQUI PARA BAIXO, NÃO MEXA. Esta linha entrega as missões para o
//  api/identificar.js usar.
// ----------------------------------------------------------------------------
module.exports = { GRUPO, ESPECIALISTA, O_QUE_PROCURAR, CERTEZA_MINIMA, conferirFoto, mensagemDeDuvida, mensagemDeAcerto };
