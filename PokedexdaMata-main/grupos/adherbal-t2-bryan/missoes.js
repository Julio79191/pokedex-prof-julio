// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo
// ============================================================================
//  Cópia do documento "Meu Back-End — Pokédex" que o grupo preencheu. O resto
//  do back-end (as chaves da IA, o revezamento, a conversa com o Google) mora
//  em api/identificar.js e é igual para todos.
//
//  Para conferir se ficou certo depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo=adherbal-t2-bryan
//
//  Ajustes feitos pela professora (o resto é como o grupo escreveu):
//   - Mensagens das missões: as frases do grupo ganharam acentos, pontuação, o "%" e um emoji, para fazer sentido para quem lê (as palavras são as do grupo).
//   - Missão 1: o documento misturava um nome de pessoa e "ornitólogo" (especialista em aves) com frutas; ficou "um especialista em frutas brasileiras".
//   - Missão 5: o grupo escreveu só a 1ª parte; foi completada com "(…% de certeza)".
//   - Escritas pela professora (estavam em branco ou incompletas no documento): Missão 3 (por que escolheram 85), Missão 6, Missão 5 (2ª parte da mensagem).
// ============================================================================

// Quem é o grupo (aparece no painel)
const GRUPO = {
  nome: "Guardiões da Floresta",
  integrantes: "Henrique, Bryan e Laís",
  escola: "Adherbal",
  turma: "Turma 2",
  tema: "Frutas brasileiras"
};

// Missão 1: quem a IA vai fingir ser
const ESPECIALISTA = "um especialista em frutas brasileiras";

// Missão 2: o que procurar na foto
const O_QUE_PROCURAR = "frutas do brasil";

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: ""
const CERTEZA_MINIMA = 85;

// Missão 4: o porteiro
function conferirFoto(foto) {
  if (!foto.type.startsWith("image/")) return "🍌 Fruta não encontrada: isso não é uma foto!";
  if (foto.size > 10000000) return "🍉 Esta imagem de fruta está muito grande! Escolha uma menor.";
  return "ok";
}

// Missão 5: quando a IA fica em dúvida
function mensagemDeDuvida(r) {
  return "🤔 Não consegui identificar a imagem da fruta (" + r.confianca + "% de certeza). Tente outra foto!";
}

// Missão 6: quando a IA acerta
function mensagemDeAcerto(r) {
  return "🍌 Uhuuul! Achamos: é " + r.nome_popular + "! Que fruta incrível do Brasil!";
}

// ----------------------------------------------------------------------------
//  DAQUI PARA BAIXO, NÃO MEXA. Esta linha entrega as missões para o
//  api/identificar.js usar.
// ----------------------------------------------------------------------------
module.exports = { GRUPO, ESPECIALISTA, O_QUE_PROCURAR, CERTEZA_MINIMA, conferirFoto, mensagemDeDuvida, mensagemDeAcerto };
