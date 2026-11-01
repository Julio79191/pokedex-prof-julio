// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo
// ============================================================================
//  Cópia do documento "Meu Back-End — Pokédex" que o grupo preencheu. O resto
//  do back-end (as chaves da IA, o revezamento, a conversa com o Google) mora
//  em api/identificar.js e é igual para todos.
//
//  Para conferir se ficou certo depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo=adherbal-t1-enzo
//
//  Ajustes feitos pela professora (o resto é como o grupo escreveu):
//   - Missão 2: o documento dizia "aves do brasil" (copiado do exemplo), mas o tema do grupo é MAMÍFEROS; ajustado.
//   - Missão 1: tirado um "_" que sobrou entre "especialista" e "em".
//   - Escritas pela professora (estavam em branco ou incompletas no documento): Missão 4 (mensagem de não é foto), Missão 4 (mensagem de foto grande), Missão 5, Missão 6.
// ============================================================================

// Quem é o grupo (aparece no painel)
const GRUPO = {
  nome: "IdentiBicho",
  integrantes: "Davi, Nycolas e Enzo",
  escola: "Adherbal",
  turma: "Turma 1",
  tema: "Mamíferos do Brasil"
};

// Missão 1: quem a IA vai fingir ser
const ESPECIALISTA = "um especialista em mamiferos do brasil";

// Missão 2: o que procurar na foto
const O_QUE_PROCURAR = "mamíferos do brasil";

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: "colhemos 80 porque, quando a IA tiver menos de 80% de certeza, o aplicativo avisará que ela está em dúvida. Assim, o usuário saberá que a resposta pode estar errada"
const CERTEZA_MINIMA = 80;

// Missão 4: o porteiro
function conferirFoto(foto) {
  if (!foto.type.startsWith("image/")) return "🐾 Opa! Isso não é uma foto! Mostre um bicho pra gente.";
  if (foto.size > 10000000) return "🐘 Essa foto é maior que um elefante! Escolha uma menor.";
  return "ok";
}

// Missão 5: quando a IA fica em dúvida
function mensagemDeDuvida(r) {
  return "🔍 Hmm… tenho só " + r.confianca + "% de certeza. Tire outra foto com o bicho bem visível!";
}

// Missão 6: quando a IA acerta
function mensagemDeAcerto(r) {
  return "🐾 Achei! É " + r.nome_popular + "! Que bicho demais!";
}

// ----------------------------------------------------------------------------
//  DAQUI PARA BAIXO, NÃO MEXA. Esta linha entrega as missões para o
//  api/identificar.js usar.
// ----------------------------------------------------------------------------
module.exports = { GRUPO, ESPECIALISTA, O_QUE_PROCURAR, CERTEZA_MINIMA, conferirFoto, mensagemDeDuvida, mensagemDeAcerto };
