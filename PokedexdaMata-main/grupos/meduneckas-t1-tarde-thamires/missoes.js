// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo
// ============================================================================
//  Cópia do documento "Meu Back-End — Pokédex" que o grupo preencheu. O
//  professor só troca o que está entre aspas (e o número da Missão 3) pelo
//  que o grupo escreveu. O resto do back-end (as chaves da IA, o revezamento,
//  a conversa com o Google) mora em api/identificar.js e é igual para todos.
//
//  Para conferir se ficou certo depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo=NOME-DESTA-PASTA
// ============================================================================

// Quem é o grupo (preenchido pelo professor; aparece no painel)
const GRUPO = {
  nome: "Os inteligentes",
  integrantes: "Thamires, Anna Isabela e Gabriel",
  escola: "Meduneckas",
  turma: "Turma 1 - Tarde",
  tema: "flores"
};

// Missão 1: quem a IA vai fingir ser
const ESPECIALISTA = "um botanico especialista em flores do brasil";

// Missão 2: o que procurar na foto
const O_QUE_PROCURAR = "flor";

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: "porque é um numero confiante"
const CERTEZA_MINIMA = 50;

// Missão 4: o porteiro
function conferirFoto(foto) {
  if (!foto.type.startsWith("image/")) return "🌸 Ops! Isso não parece ser uma foto de uma flor!";
  if (foto.size > 10000000) return "🌻 Essa foto está grande demais! Escolha uma imagem menor.";
  return "ok";
}

// Missão 5: quando a IA fica em dúvida
function mensagemDeDuvida(r) {
  return "🌼 Hmm... Estou com " + r.confianca + "% de certeza. Tente tirar outra foto da flor, mais de perto!";
}

// Missão 6: quando a IA acerta
function mensagemDeAcerto(r) {
  return "🌹 Encontrei! Essa linda flor é " + r.nome_popular + "! 🌸";
}

// ----------------------------------------------------------------------------
//  DAQUI PARA BAIXO, NÃO MEXA. Esta linha entrega as missões para o
//  api/identificar.js usar.
// ----------------------------------------------------------------------------
module.exports = { GRUPO, ESPECIALISTA, O_QUE_PROCURAR, CERTEZA_MINIMA, conferirFoto, mensagemDeDuvida, mensagemDeAcerto };
