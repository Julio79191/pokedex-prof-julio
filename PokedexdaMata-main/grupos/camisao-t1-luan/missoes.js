// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo
// ============================================================================
//  Cópia do documento "Meu Back-End — Pokédex" que o grupo preencheu. O resto
//  do back-end (as chaves da IA, o revezamento, a conversa com o Google) mora
//  em api/identificar.js e é igual para todos.
//
//  Para conferir se ficou certo depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo=camisao-t1-luan
//
//  Ajustes feitos pela professora (o resto é como o grupo escreveu):
//   - Mensagens das missões: as frases do grupo ganharam acentos, pontuação, o "%" e um emoji, para fazer sentido para quem lê (as palavras são as do grupo).
//   - Missão 1: no documento ficou "const ESPECIALIST" sem o "=", o que quebraria o código; o texto do grupo foi mantido.
//   - Missão 5: o grupo escreveu "r.confianca (50)", que quebraria o código; ficou só r.confianca.
// ============================================================================

// Quem é o grupo (aparece no painel)
const GRUPO = {
  nome: "Conjuntos da Floresta",
  integrantes: "Luan, Nicolas e Maria",
  escola: "Camisão",
  turma: "Turma 1",
  tema: "Aves do Brasil"
};

// Missão 1: quem a IA vai fingir ser
const ESPECIALISTA = "um ornitólogo especialista em aves do brasil";

// Missão 2: o que procurar na foto
const O_QUE_PROCURAR = "aves do brasil";

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: "por que e um numero a meio que pode ta com duvida ou nao duvida"
const CERTEZA_MINIMA = 50;

// Missão 4: o porteiro
function conferirFoto(foto) {
  if (!foto.type.startsWith("image/")) return "🐦 Opa! Isso que você mandou não é uma foto. Por favor, mande uma foto de verdade!";
  if (foto.size > 10000000) return "🐦 Essa foto é grande demais! Mande de novo, menor, por favor.";
  return "ok";
}

// Missão 5: quando a IA fica em dúvida
function mensagemDeDuvida(r) {
  return "🤔 Não tenho tanta certeza sobre isso: só " + r.confianca + "%. Tente novamente!";
}

// Missão 6: quando a IA acerta
function mensagemDeAcerto(r) {
  return "🎉 Consegui achar o que você mandou: " + r.nome_popular + "! Isso é muito legal!";
}

// ----------------------------------------------------------------------------
//  DAQUI PARA BAIXO, NÃO MEXA. Esta linha entrega as missões para o
//  api/identificar.js usar.
// ----------------------------------------------------------------------------
module.exports = { GRUPO, ESPECIALISTA, O_QUE_PROCURAR, CERTEZA_MINIMA, conferirFoto, mensagemDeDuvida, mensagemDeAcerto };
