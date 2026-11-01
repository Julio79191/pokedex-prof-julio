// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo
// ============================================================================
//  Cópia do documento "Meu Back-End — Pokédex" que o grupo preencheu. O resto
//  do back-end (as chaves da IA, o revezamento, a conversa com o Google) mora
//  em api/identificar.js e é igual para todos.
//
//  Para conferir se ficou certo depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo=camisao-t2m-lucas
//
//  Ajustes feitos pela professora (o resto é como o grupo escreveu):
//   - O grupo entregou o documento do back-end em branco: as 6 missões foram preenchidas pela professora, seguindo a ideia do app (o Rotom que só reconhece animais terrestres).
//   - A biblioteca guardava a foto em tamanho original e enchia o espaço do navegador: agora guarda uma versão menor.
//   - Escritas pela professora (estavam em branco ou incompletas no documento): Missão 1, Missão 2, Missão 3, Missão 4 (mensagem de não é foto), Missão 4 (mensagem de foto grande), Missão 5, Missão 6.
// ============================================================================

// Quem é o grupo (aparece no painel)
const GRUPO = {
  nome: "Jardim do Leafeon",
  integrantes: "Lucas, Kauã e Ruan",
  escola: "Camisão",
  turma: "Turma 2 - M",
  tema: "Animais terrestres"
};

// Missão 1: quem a IA vai fingir ser
const ESPECIALISTA = "um zoólogo especialista em animais terrestres da mata";

// Missão 2: o que procurar na foto
const O_QUE_PROCURAR = "animais terrestres";

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: "(definido pela professora: é o mesmo número que o front do grupo já usava)"
const CERTEZA_MINIMA = 80;

// Missão 4: o porteiro
function conferirFoto(foto) {
  if (!foto.type.startsWith("image/")) return "⚡ Bzzt! O Rotom diz que isso não é uma foto! Mostre um animal.";
  if (foto.size > 10000000) return "🍃 Essa foto é pesada demais pro Rotom! Escolha uma menor.";
  return "ok";
}

// Missão 5: quando a IA fica em dúvida
function mensagemDeDuvida(r) {
  return "⚡ O Rotom tem só " + r.confianca + "% de certeza… tente uma foto com o animal inteirinho!";
}

// Missão 6: quando a IA acerta
function mensagemDeAcerto(r) {
  return "⚡ Bzzt! Entrada registrada: é " + r.nome_popular + "! O Leafeon adorou!";
}

// ----------------------------------------------------------------------------
//  DAQUI PARA BAIXO, NÃO MEXA. Esta linha entrega as missões para o
//  api/identificar.js usar.
// ----------------------------------------------------------------------------
module.exports = { GRUPO, ESPECIALISTA, O_QUE_PROCURAR, CERTEZA_MINIMA, conferirFoto, mensagemDeDuvida, mensagemDeAcerto };
