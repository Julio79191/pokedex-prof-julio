// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo
// ============================================================================
//  Cópia do documento "Meu Back-End — Pokédex" que o grupo preencheu. O resto
//  do back-end (as chaves da IA, o revezamento, a conversa com o Google) mora
//  em api/identificar.js e é igual para todos.
//
//  Para conferir se ficou certo depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo=adherbal-t2-emilly
//
//  Ajustes feitos pela professora (o resto é como o grupo escreveu):
//   - Mensagens das missões: as frases do grupo ganharam acentos, pontuação, o "%" e um emoji, para fazer sentido para quem lê (as palavras são as do grupo).
//   - Missão 3 estava em branco: usado 80, o mesmo número que o front do grupo já usava.
//   - Missão 5: só foi colocado o "%" depois do número.
//   - Missão 6: o grupo escreveu só "Para" no final (provavelmente "Parabéns") — conferir com o grupo.
//   - Escritas pela professora (estavam em branco ou incompletas no documento): Missão 3 (número e por quê), Missão 6 (confirmar o final da frase).
// ============================================================================

// Quem é o grupo (aparece no painel)
const GRUPO = {
  nome: "Asas da Arara Azul",
  integrantes: "Leonardo, Emilly e Ana",
  escola: "Adherbal",
  turma: "Turma 2",
  tema: "Aves"
};

// Missão 1: quem a IA vai fingir ser
const ESPECIALISTA = "um ornitólogo especialista";

// Missão 2: o que procurar na foto
const O_QUE_PROCURAR = "aves do Brasil";

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: ""
const CERTEZA_MINIMA = 80;

// Missão 4: o porteiro
function conferirFoto(foto) {
  if (!foto.type.startsWith("image/")) return "🦜 Isso eu não consigo reconhecer: não é uma imagem! Tente novamente.";
  if (foto.size > 10000000) return "🦜 Essa imagem está muito grande! Você pode tentar uma imagem menor?";
  return "ok";
}

// Missão 5: quando a IA fica em dúvida
function mensagemDeDuvida(r) {
  return "🤔 Só tenho " + r.confianca + "% de certeza dessa imagem. Tente outra foto da ave!";
}

// Missão 6: quando a IA acerta
function mensagemDeAcerto(r) {
  return "🎉 Pronto, consegui! É " + r.nome_popular + "! Parabéns!";
}

// ----------------------------------------------------------------------------
//  DAQUI PARA BAIXO, NÃO MEXA. Esta linha entrega as missões para o
//  api/identificar.js usar.
// ----------------------------------------------------------------------------
module.exports = { GRUPO, ESPECIALISTA, O_QUE_PROCURAR, CERTEZA_MINIMA, conferirFoto, mensagemDeDuvida, mensagemDeAcerto };
