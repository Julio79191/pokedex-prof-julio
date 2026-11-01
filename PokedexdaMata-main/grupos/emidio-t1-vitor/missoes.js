// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo
// ============================================================================
//  Cópia do documento "Meu Back-End — Pokédex" que o grupo preencheu. O resto
//  do back-end (as chaves da IA, o revezamento, a conversa com o Google) mora
//  em api/identificar.js e é igual para todos.
//
//  Para conferir se ficou certo depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo=emidio-t1-vitor
// ============================================================================

// Ajustes feitos pela professora:
//   - Mensagens das missões: as frases do grupo ganharam acentos, pontuação, o "%" e um emoji, para fazer sentido para quem lê (as palavras são as do grupo).

// Quem é o grupo (aparece no painel)
const GRUPO = {
  nome: "Os sem sementes",
  integrantes: "Mikael, Vitor, Matheus, Alexandre e Wellington",
  escola: "Emídio",
  turma: "Turma 1",
  tema: "Frutas brasileiras"
};

// Missão 1: quem a IA vai fingir ser
const ESPECIALISTA = "um fruticultor especialista em frutas brasileiras";

// Missão 2: o que procurar na foto
const O_QUE_PROCURAR = "Frutas Brasileiras";

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: ""
const CERTEZA_MINIMA = 79;

// Missão 4: o porteiro
function conferirFoto(foto) {
  if (!foto.type.startsWith("image/")) return "🍉 Erro: isso não é uma imagem!";
  if (foto.size > 10000000) return "🍉 Foto muito grande! Escolha uma menor.";
  return "ok";
}

// Missão 5: quando a IA fica em dúvida
function mensagemDeDuvida(r) {
  return "🤔 Não entendi direito: só tenho " + r.confianca + "% de certeza. Me dê mais detalhes: tire outra foto da fruta!";
}

// Missão 6: quando a IA acerta
function mensagemDeAcerto(r) {
  return "🍍 Essa é a fruta: " + r.nome_popular + "! Muito bem!";
}

// ----------------------------------------------------------------------------
//  DAQUI PARA BAIXO, NÃO MEXA. Esta linha entrega as missões para o
//  api/identificar.js usar.
// ----------------------------------------------------------------------------
module.exports = { GRUPO, ESPECIALISTA, O_QUE_PROCURAR, CERTEZA_MINIMA, conferirFoto, mensagemDeDuvida, mensagemDeAcerto };
