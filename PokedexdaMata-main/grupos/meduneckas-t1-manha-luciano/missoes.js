// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo
// ============================================================================
//  Cópia do documento "Meu Back-End — Pokédex" que o grupo preencheu. O resto
//  do back-end (as chaves da IA, o revezamento, a conversa com o Google) mora
//  em api/identificar.js e é igual para todos.
//
//  Para conferir se ficou certo depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo=meduneckas-t1-manha-luciano
//
//  Ajustes feitos pela professora (o resto é como o grupo escreveu):
//   - Missão 2: no documento o nome ficou "O_QUE_ PROCURAR" (com espaço), o que quebraria o código; o texto do grupo foi mantido.
//   - Missão 1: tirado um "_" que sobrou entre "especialista" e "em".
// ============================================================================

// Quem é o grupo (aparece no painel)
const GRUPO = {
  nome: "Raízes do Amanhã",
  integrantes: "Luciano e Enzo",
  escola: "Meduneckas",
  turma: "Turma 1 - Manhã",
  tema: "Répteis e anfíbios"
};

// Missão 1: quem a IA vai fingir ser
const ESPECIALISTA = "um herpetólogo especialista em répteis e anfibios do brasil";

// Missão 2: o que procurar na foto
const O_QUE_PROCURAR = "répteis e anfíbios do brasil";

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: ""
const CERTEZA_MINIMA = 60;

// Missão 4: o porteiro
function conferirFoto(foto) {
  if (!foto.type.startsWith("image/")) return "🐸 Ops! Esse arquivo não é uma foto de um bichinho!";
  if (foto.size > 10000000) return "🐊 Eita! Essa foto está grandona! Escolha outra mais leve.";
  return "ok";
}

// Missão 5: quando a IA fica em dúvida
function mensagemDeDuvida(r) {
  return "🔎 Hum... ainda estou explorando! Tenho " + r.confianca + "% de certeza. Tente outra foto do réptil ou anfíbio! 🌿";
}

// Missão 6: quando a IA acerta
function mensagemDeAcerto(r) {
  return "🎉 Croac-croac! Descobri! Esse bichinho é o " + r.nome_popular + " 🐸💚 Vamos conhecer mais sobre ele!";
}

// ----------------------------------------------------------------------------
//  DAQUI PARA BAIXO, NÃO MEXA. Esta linha entrega as missões para o
//  api/identificar.js usar.
// ----------------------------------------------------------------------------
module.exports = { GRUPO, ESPECIALISTA, O_QUE_PROCURAR, CERTEZA_MINIMA, conferirFoto, mensagemDeDuvida, mensagemDeAcerto };
