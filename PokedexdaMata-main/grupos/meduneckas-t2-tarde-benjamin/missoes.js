// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo
// ============================================================================
//  Cópia do documento "Meu Back-End — Pokédex" que o grupo preencheu. O resto
//  do back-end (as chaves da IA, o revezamento, a conversa com o Google) mora
//  em api/identificar.js e é igual para todos.
//
//  Para conferir se ficou certo depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo=meduneckas-t2-tarde-benjamin
//
//  Ajustes feitos pela professora (o resto é como o grupo escreveu):
//   - Missões 1 e 2: o documento dizia "ornitólogos" e "Aves brasileiras", mas os dois fronts do grupo (Réptisfera e All Star 🐍) são de RÉPTEIS; ajustado para répteis (confirmado pela professora).
//   - Missões 3 a 6: o documento tinha erros de aspas e o nome "const A" no lugar de CERTEZA_MINIMA; as frases e o número (80) do grupo foram mantidos.
//   - Missão 5: a frase do grupo foi completada para fazer sentido ("Estou em dúvida 95" → "Só tenho 95% de certeza de qual réptil é esse…").
//   - O front (Réptisfera) não tinha identificação por IA; foi ligado o botão "Identificar réptil".
// ============================================================================

// Quem é o grupo (aparece no painel)
const GRUPO = {
  nome: "All Star",
  integrantes: "Paulo, Benjamin e Fernanda",
  escola: "Meduneckas",
  turma: "Turma 2 - Tarde",
  tema: "Répteis"
};

// Missão 1: quem a IA vai fingir ser
const ESPECIALISTA = "um herpetólogo especialista em répteis do Brasil";

// Missão 2: o que procurar na foto
const O_QUE_PROCURAR = "répteis";

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: "Por que nunca é 100% de certeza"
const CERTEZA_MINIMA = 80;

// Missão 4: o porteiro
function conferirFoto(foto) {
  if (!foto.type.startsWith("image/")) return "Isso não pode ser uma foto";
  if (foto.size > 10000000) return "A foto está grande demais pode escolher outra?";
  return "ok";
}

// Missão 5: quando a IA fica em dúvida
function mensagemDeDuvida(r) {
  return "🦎 Estou em dúvida! Só tenho " + r.confianca + "% de certeza de qual réptil é esse. Escolha outra foto, mais de pertinho e mostrando o bicho inteiro! 🐢";
}

// Missão 6: quando a IA acerta
function mensagemDeAcerto(r) {
  return "Encontrei " + r.nome_popular + "!";
}

// ----------------------------------------------------------------------------
//  DAQUI PARA BAIXO, NÃO MEXA. Esta linha entrega as missões para o
//  api/identificar.js usar.
// ----------------------------------------------------------------------------
module.exports = { GRUPO, ESPECIALISTA, O_QUE_PROCURAR, CERTEZA_MINIMA, conferirFoto, mensagemDeDuvida, mensagemDeAcerto };
