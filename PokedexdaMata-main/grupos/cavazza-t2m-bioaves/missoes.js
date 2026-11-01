// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo
// ============================================================================
//  Cópia do documento "Meu Back-End — Pokédex" que o grupo preencheu. O resto
//  do back-end (as chaves da IA, o revezamento, a conversa com o Google) mora
//  em api/identificar.js e é igual para todos.
//
//  Para conferir se ficou certo depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo=cavazza-t2m-bioaves
//
//  Ajustes feitos pela professora (o resto é como o grupo escreveu):
//   - O histórico guardava a foto em tamanho original e enchia o espaço do navegador: agora guarda uma versão menor.
//   - O front fala em aves, animais, plantas e frutas, mas o documento escolheu "aves do mundo": valeu o documento.
//   - Escritas pela professora (estavam em branco ou incompletas no documento): Missão 5, Missão 6.
// ============================================================================

// Quem é o grupo (aparece no painel)
const GRUPO = {
  nome: "BIOAVES",
  integrantes: "Miguel e Clara",
  escola: "Cavazza",
  turma: "Turma 2 - Manhã",
  tema: "Aves do mundo"
};

// Missão 1: quem a IA vai fingir ser
const ESPECIALISTA = "um ornitólogo especialista em aves do mundo";

// Missão 2: o que procurar na foto
const O_QUE_PROCURAR = "aves do mundo";

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: "por que a ia tem a metade de certeza de que esta certo uo errado."
const CERTEZA_MINIMA = 50;

// Missão 4: o porteiro
function conferirFoto(foto) {
  if (!foto.type.startsWith("image/")) return "🐦 Ops! Esse arquivo não é uma foto de ave! Envie uma imagem de uma ave para continuar! 🦜💚";
  if (foto.size > 10000000) return "🦅 Ops! Essa foto é grande demais! Envie uma imagem menor para continuar! 🐦💚";
  return "ok";
}

// Missão 5: quando a IA fica em dúvida
function mensagemDeDuvida(r) {
  return "🐦 Piu? Só tenho " + r.confianca + "% de certeza… tente outra foto com a ave mais pertinho!";
}

// Missão 6: quando a IA acerta
function mensagemDeAcerto(r) {
  return "🦜 Achei! Essa ave é " + r.nome_popular + "! Que penas lindas!";
}

// ----------------------------------------------------------------------------
//  DAQUI PARA BAIXO, NÃO MEXA. Esta linha entrega as missões para o
//  api/identificar.js usar.
// ----------------------------------------------------------------------------
module.exports = { GRUPO, ESPECIALISTA, O_QUE_PROCURAR, CERTEZA_MINIMA, conferirFoto, mensagemDeDuvida, mensagemDeAcerto };
