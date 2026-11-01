// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo
// ============================================================================
//  Cópia do documento "Meu Back-End — Pokédex" que o grupo preencheu. O resto
//  do back-end (as chaves da IA, o revezamento, a conversa com o Google) mora
//  em api/identificar.js e é igual para todos.
//
//  Para conferir se ficou certo depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo=camisao-t2m-sther
//
//  Ajustes feitos pela professora (o resto é como o grupo escreveu):
//   - O grupo entregou o documento do back-end quase em branco: as missões foram preenchidas pela professora.
//   - O front do grupo era só um catálogo de animais: foi adicionada a parte "Descobrir pela foto" (com câmera) e o "Meu Codex" (álbum), no mesmo visual do grupo.
//   - As fotos do catálogo vinham de links soltos (o tucano e a ararinha usavam a mesma foto de outra arara): agora cada animal busca a foto certa pela espécie.
//   - Escritas pela professora (estavam em branco ou incompletas no documento): Missão 1, Missão 2, Missão 3 (o número), Missão 4 (mensagem de não é foto), Missão 4 (mensagem de foto grande), Missão 5, Missão 6.
// ============================================================================

// Quem é o grupo (aparece no painel)
const GRUPO = {
  nome: "Blinkis (Codex)",
  integrantes: "Anna Laynara, Evelyn e Sther",
  escola: "Camisão",
  turma: "Turma 2 - M",
  tema: "Animais"
};

// Missão 1: quem a IA vai fingir ser
const ESPECIALISTA = "um zoólogo especialista em animais";

// Missão 2: o que procurar na foto
const O_QUE_PROCURAR = "animais";

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: "porque achamos interessante (o número ficou em branco; 80 definido pela professora)"
const CERTEZA_MINIMA = 80;

// Missão 4: o porteiro
function conferirFoto(foto) {
  if (!foto.type.startsWith("image/")) return "💙 Ops! Isso não é uma foto! Mostre um animal pro Codex.";
  if (foto.size > 10000000) return "💗 Essa foto é grande demais pro Codex! Escolha uma menor.";
  return "ok";
}

// Missão 5: quando a IA fica em dúvida
function mensagemDeDuvida(r) {
  return "💛 O Codex tem só " + r.confianca + "% de certeza… tente outra foto do animal mais pertinho!";
}

// Missão 6: quando a IA acerta
function mensagemDeAcerto(r) {
  return "⭐ Novo animal no Codex: é " + r.nome_popular + "! Que fofura!";
}

// ----------------------------------------------------------------------------
//  DAQUI PARA BAIXO, NÃO MEXA. Esta linha entrega as missões para o
//  api/identificar.js usar.
// ----------------------------------------------------------------------------
module.exports = { GRUPO, ESPECIALISTA, O_QUE_PROCURAR, CERTEZA_MINIMA, conferirFoto, mensagemDeDuvida, mensagemDeAcerto };
