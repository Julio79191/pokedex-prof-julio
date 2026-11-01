// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo
// ============================================================================
//  Cópia do documento "Meu Back-End — Pokédex" que o grupo preencheu. O resto
//  do back-end (as chaves da IA, o revezamento, a conversa com o Google) mora
//  em api/identificar.js e é igual para todos.
//
//  Para conferir se ficou certo depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo=meduneckas-t1-tarde-davi
// ============================================================================

// Quem é o grupo (aparece no painel)
const GRUPO = {
  nome: "Brasilian Bird",
  integrantes: "Bernardo N., Valentina, Ester, Theo A. e Davi",
  escola: "Meduneckas",
  turma: "Turma 1 - Tarde",
  tema: "Aves do Brasil"
};

// Missão 1: quem a IA vai fingir ser
const ESPECIALISTA = "um ornitólogo especialista em aves do Brasil";

// Missão 2: o que procurar na foto
const O_QUE_PROCURAR = "ave";

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: "Porque imaginamos que seja um bom número usado como \"certeza mínima\" pra IA."
const CERTEZA_MINIMA = 75;

// Missão 4: o porteiro
function conferirFoto(foto) {
  if (!foto.type.startsWith("image/")) return "Eu ACHO, só ACHO que isso não é uma foto twin. Tente novamente, você merece mais uma chance!";
  if (foto.size > 10000000) return "O arquivo da foto é pesado demais! Tem como escolher algo mais leve não?";
  return "ok";
}

// Missão 5: quando a IA fica em dúvida
function mensagemDeDuvida(r) {
  return "Tenho apenas " + r.confianca + "% de certeza. Tente outra foto!";
}

// Missão 6: quando a IA acerta
function mensagemDeAcerto(r) {
  return "Achei! É um " + r.nome_popular + "! Que demais!";
}

// ----------------------------------------------------------------------------
//  DAQUI PARA BAIXO, NÃO MEXA. Esta linha entrega as missões para o
//  api/identificar.js usar.
// ----------------------------------------------------------------------------
module.exports = { GRUPO, ESPECIALISTA, O_QUE_PROCURAR, CERTEZA_MINIMA, conferirFoto, mensagemDeDuvida, mensagemDeAcerto };
