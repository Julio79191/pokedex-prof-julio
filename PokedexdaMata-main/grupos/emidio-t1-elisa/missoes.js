// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo
// ============================================================================
//  Cópia do documento "Meu Back-End — Pokédex" que o grupo preencheu. O resto
//  do back-end (as chaves da IA, o revezamento, a conversa com o Google) mora
//  em api/identificar.js e é igual para todos.
//
//  Para conferir se ficou certo depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo=emidio-t1-elisa
//
//  Ajustes feitos pela professora (o resto é como o grupo escreveu):
//   - Mensagens das missões: as frases do grupo ganharam acentos, pontuação, o "%" e um emoji, para fazer sentido para quem lê (as palavras são as do grupo).
//   - Missões 4 e 5: faltaram aspas (") em volta das frases, o que quebraria o código; as frases do grupo foram mantidas.
// ============================================================================

// Quem é o grupo (aparece no painel)
const GRUPO = {
  nome: "Forest",
  integrantes: "Heloisa, Elisa, Nicolly e Maria",
  escola: "Emídio",
  turma: "Turma 1",
  tema: "Árvores brasileiras"
};

// Missão 1: quem a IA vai fingir ser
const ESPECIALISTA = "arborista especialista em arvores brasileiras";

// Missão 2: o que procurar na foto
const O_QUE_PROCURAR = "arvores brasileiras";

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: "por ela nao tem certeza se ta certo"
const CERTEZA_MINIMA = 70;

// Missão 4: o porteiro
function conferirFoto(foto) {
  if (!foto.type.startsWith("image/")) return "🕵️ Isso não é uma foto!";
  if (foto.size > 10000000) return "🕵️ Essa imagem é grande demais! Escolha uma menor.";
  return "ok";
}

// Missão 5: quando a IA fica em dúvida
function mensagemDeDuvida(r) {
  return "🌳 Essa foi a árvore que eu achei, mas não tenho certeza da decisão: só " + r.confianca + "%. Me dê mais informações: tire outra foto, mostrando folhas, tronco ou flores!";
}

// Missão 6: quando a IA acerta
function mensagemDeAcerto(r) {
  return "🕵️ Encontrei! Essa árvore é: " + r.nome_popular + ". Muito bem, detetive!";
}

// ----------------------------------------------------------------------------
//  DAQUI PARA BAIXO, NÃO MEXA. Esta linha entrega as missões para o
//  api/identificar.js usar.
// ----------------------------------------------------------------------------
module.exports = { GRUPO, ESPECIALISTA, O_QUE_PROCURAR, CERTEZA_MINIMA, conferirFoto, mensagemDeDuvida, mensagemDeAcerto };
