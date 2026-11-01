// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo
// ============================================================================
//  Cópia do documento "Meu Back-End — Pokédex" que o grupo preencheu. O resto
//  do back-end (as chaves da IA, o revezamento, a conversa com o Google) mora
//  em api/identificar.js e é igual para todos.
//
//  Para conferir se ficou certo depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo=camisao-t1m-isabelly
//
//  Ajustes feitos pela professora (o resto é como o grupo escreveu):
//   - Mensagens das missões: as frases do grupo ganharam acentos, pontuação, o "%" e um emoji, para fazer sentido para quem lê (as palavras são as do grupo).
//   - O grupo não entregou o front: a página foi montada pela professora a partir do README do grupo e das fotos de bem-te-vi coletadas pela Isabelly (as fotos 4 e 10, com marca d'água de fotógrafos, ficaram de fora).
//   - Escritas pela professora (estavam em branco ou incompletas no documento): Missão 5, Missão 6.
// ============================================================================

// Quem é o grupo (aparece no painel)
const GRUPO = {
  nome: "Detetives de Penas",
  integrantes: "Hyan, Thales, Sophia e Isabelly",
  escola: "Camisão",
  turma: "Turma 1 - M",
  tema: "Aves do Brasil"
};

// Missão 1: quem a IA vai fingir ser
const ESPECIALISTA = "um ornitólogo especialista em aves do Brasil";

// Missão 2: o que procurar na foto
const O_QUE_PROCURAR = "aves do Brasil";

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: ""
const CERTEZA_MINIMA = 60;

// Missão 4: o porteiro
function conferirFoto(foto) {
  if (!foto.type.startsWith("image/")) return "🕵️ Opa! Arquivo não compatível: isso não é uma foto.";
  if (foto.size > 10000000) return "🕵️ Arquivo muito pesado para o nosso app! Escolha uma foto menor.";
  return "ok";
}

// Missão 5: quando a IA fica em dúvida
function mensagemDeDuvida(r) {
  return "🕵️ As pistas estão fracas: só " + r.confianca + "% de certeza. Tente outra foto, detetive!";
}

// Missão 6: quando a IA acerta
function mensagemDeAcerto(r) {
  return "🕵️ Caso resolvido! A ave é " + r.nome_popular + "! Que detetive incrível!";
}

// ----------------------------------------------------------------------------
//  DAQUI PARA BAIXO, NÃO MEXA. Esta linha entrega as missões para o
//  api/identificar.js usar.
// ----------------------------------------------------------------------------
module.exports = { GRUPO, ESPECIALISTA, O_QUE_PROCURAR, CERTEZA_MINIMA, conferirFoto, mensagemDeDuvida, mensagemDeAcerto };
