// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo
// ============================================================================
//  Cópia do documento "Meu Back-End — Pokédex" que o grupo preencheu. O resto
//  do back-end (as chaves da IA, o revezamento, a conversa com o Google) mora
//  em api/identificar.js e é igual para todos.
//
//  Para conferir se ficou certo depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo=cavazza-t1-izaque
//
//  Ajustes feitos pela professora (o resto é como o grupo escreveu):
//   - Missão 2: "planta medicinais" virou "planta medicinal" (concordância).
//   - Escritas pela professora (estavam em branco ou incompletas no documento): Missão 4 (mensagem de não é foto), Missão 4 (mensagem de foto grande), Missão 5, Missão 6.
// ============================================================================

// Quem é o grupo (aparece no painel)
const GRUPO = {
  nome: "Os Caçadores",
  integrantes: "Izaque, David, Nicy, Dav e Ana",
  escola: "Cavazza",
  turma: "Turma 1",
  tema: "Plantas medicinais"
};

// Missão 1: quem a IA vai fingir ser
const ESPECIALISTA = "um fitoterapeuta especialista em plantas medicinais";

// Missão 2: o que procurar na foto
const O_QUE_PROCURAR = "planta medicinal";

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: ""
const CERTEZA_MINIMA = 60;

// Missão 4: o porteiro
function conferirFoto(foto) {
  if (!foto.type.startsWith("image/")) return "🏹 Caçador, isso não é uma foto! Mire numa planta e tente de novo.";
  if (foto.size > 10000000) return "🎒 Essa foto é pesada demais pra mochila do caçador! Escolha uma menor.";
  return "ok";
}

// Missão 5: quando a IA fica em dúvida
function mensagemDeDuvida(r) {
  return "🔎 A pista está fraca: só " + r.confianca + "% de certeza. Chegue mais perto da planta!";
}

// Missão 6: quando a IA acerta
function mensagemDeAcerto(r) {
  return "🏹 Caçada concluída! Essa planta é " + r.nome_popular + "! (Planta medicinal só com um adulto, viu?)";
}

// ----------------------------------------------------------------------------
//  DAQUI PARA BAIXO, NÃO MEXA. Esta linha entrega as missões para o
//  api/identificar.js usar.
// ----------------------------------------------------------------------------
module.exports = { GRUPO, ESPECIALISTA, O_QUE_PROCURAR, CERTEZA_MINIMA, conferirFoto, mensagemDeDuvida, mensagemDeAcerto };
