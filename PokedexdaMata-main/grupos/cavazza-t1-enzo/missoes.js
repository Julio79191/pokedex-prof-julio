// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo
// ============================================================================
//  Cópia do documento "Meu Back-End — Pokédex" que o grupo preencheu. O resto
//  do back-end (as chaves da IA, o revezamento, a conversa com o Google) mora
//  em api/identificar.js e é igual para todos.
//
//  Para conferir se ficou certo depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo=cavazza-t1-enzo
//
//  Ajustes feitos pela professora (o resto é como o grupo escreveu):
//   - O documento do back-end veio todo em branco: as 6 missões foram preenchidas pela professora para o app funcionar.
//   - Escritas pela professora (estavam em branco ou incompletas no documento): Missão 1, Missão 2, Missão 3, Missão 4 (mensagem de não é foto), Missão 4 (mensagem de foto grande), Missão 5, Missão 6.
// ============================================================================

// Quem é o grupo (aparece no painel)
const GRUPO = {
  nome: "FrutaThech",
  integrantes: "Luckhas, Enzo, João e Ana",
  escola: "Cavazza",
  turma: "Turma 1",
  tema: "Frutas brasileiras"
};

// Missão 1: quem a IA vai fingir ser
const ESPECIALISTA = "um especialista em frutas brasileiras";

// Missão 2: o que procurar na foto
const O_QUE_PROCURAR = "fruta brasileira";

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: "(definido pela professora)"
const CERTEZA_MINIMA = 80;

// Missão 4: o porteiro
function conferirFoto(foto) {
  if (!foto.type.startsWith("image/")) return "🍓 Eita! Isso não é uma foto! Mande a foto de uma fruta.";
  if (foto.size > 10000000) return "🍉 Essa foto é maior que uma melancia! Escolha uma menor.";
  return "ok";
}

// Missão 5: quando a IA fica em dúvida
function mensagemDeDuvida(r) {
  return "🤔 Tô só " + r.confianca + "% certo… Tire outra foto com a fruta bem de pertinho!";
}

// Missão 6: quando a IA acerta
function mensagemDeAcerto(r) {
  return "🍍 Fruta encontrada: é " + r.nome_popular + "! Que delícia de descoberta!";
}

// ----------------------------------------------------------------------------
//  DAQUI PARA BAIXO, NÃO MEXA. Esta linha entrega as missões para o
//  api/identificar.js usar.
// ----------------------------------------------------------------------------
module.exports = { GRUPO, ESPECIALISTA, O_QUE_PROCURAR, CERTEZA_MINIMA, conferirFoto, mensagemDeDuvida, mensagemDeAcerto };
