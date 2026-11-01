// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo
// ============================================================================
//  Cópia do documento "Meu Back-End — Pokédex" que o grupo preencheu. O resto
//  do back-end (as chaves da IA, o revezamento, a conversa com o Google) mora
//  em api/identificar.js e é igual para todos.
//
//  Para conferir se ficou certo depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo=meduneckas-t2-tarde-davi
//
//  Ajustes feitos pela professora (o resto é como o grupo escreveu):
//   - Missões 5 e 6: frases do grupo com acentos, o "%" e um emoji, para fazer sentido ("nao tenho tanta certeza 10" → "Não tenho tanta certeza: só 10%").
//   - O front fazia uma "simulação" de câmera (sorteava um animal do catálogo); a câmera agora manda a foto de verdade para a IA.
// ============================================================================

// Quem é o grupo (aparece no painel)
const GRUPO = {
  nome: "Caçadores de Mamíferos",
  integrantes: "Pedro, Davi e Nicolas",
  escola: "Meduneckas",
  turma: "Turma 2 - Tarde",
  tema: "Mamíferos"
};

// Missão 1: quem a IA vai fingir ser
const ESPECIALISTA = "um biologo especialista em mamiferos brasileiros";

// Missão 2: o que procurar na foto
const O_QUE_PROCURAR = "mamiferos";

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: "porque 85 exige uma boa certeza da ia mas ainda permite identificar animais errados como aves e peixes"
const CERTEZA_MINIMA = 85;

// Missão 4: o porteiro
function conferirFoto(foto) {
  if (!foto.type.startsWith("image/")) return "ops a imagem nao e uma foto porfavor escolha outra";
  if (foto.size > 10000000) return "opa foto muito grande escolha uma menor";
  return "ok";
}

// Missão 5: quando a IA fica em dúvida
function mensagemDeDuvida(r) {
  return "🐾 Não tenho tanta certeza: só " + r.confianca + "%. Tente outra foto do mamífero, mais de pertinho!";
}

// Missão 6: quando a IA acerta
function mensagemDeAcerto(r) {
  return "🎉 Encontrei! É " + r.nome_popular + "!";
}

// ----------------------------------------------------------------------------
//  DAQUI PARA BAIXO, NÃO MEXA. Esta linha entrega as missões para o
//  api/identificar.js usar.
// ----------------------------------------------------------------------------
module.exports = { GRUPO, ESPECIALISTA, O_QUE_PROCURAR, CERTEZA_MINIMA, conferirFoto, mensagemDeDuvida, mensagemDeAcerto };
