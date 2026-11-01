// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo  (MODELO EM BRANCO)
// ============================================================================
//  Como usar:
//    1. Copie este arquivo para grupos/<apelido-do-grupo>/missoes.js
//    2. Troque o que está entre aspas pelo que o grupo escreveu no documento
//       "Meu Back-End — Pokédex" (e o número da Missão 3, que vai SEM aspas).
//    3. Missão que o grupo deixou em branco? Use o exemplo do documento e
//       escreva o nome dela em "pendencias": ela aparece em amarelo no painel,
//       para você lembrar de completar com o grupo.
//
//  O resto do back-end (as chaves da IA, o revezamento, a conversa com o
//  Google) mora em api/identificar.js e é igual para todos: não mexa lá.
//
//  Para conferir depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo=APELIDO-DO-GRUPO
// ============================================================================

// Quem é o grupo (aparece no painel). Use SÓ o primeiro nome dos alunos:
// o site é público.
const GRUPO = {
  nome: "Nome do grupo",
  integrantes: "Ana, Bruno e Carla",
  escola: "Escola",
  turma: "Turma 1",
  tema: "Flores do Brasil",
  pendencias: []          // ex.: ["Missão 5", "Missão 6"]
};

// Missão 1: quem a IA vai fingir ser
// Exemplo (tema flores): "um botânico especialista em flores do Brasil"
const ESPECIALISTA = "um botânico especialista em flores do Brasil";

// Missão 2: o que procurar na foto (uma ou duas palavras)
// Aparece também na mensagem de "fora do tema":
//   "🚫 Não reconhecemos porque isso parece ser uma melancia, e aqui a gente
//    só reconhece <O_QUE_PROCURAR>."
const O_QUE_PROCURAR = "flores";

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: ""
const CERTEZA_MINIMA = 80;

// Missão 4: o porteiro
function conferirFoto(foto) {
  if (!foto.type.startsWith("image/")) return "📷 Isso não é uma foto!";
  if (foto.size > 10000000) return "🐘 Foto grande demais! Escolha outra.";
  return "ok";
}

// Missão 5: quando a IA fica em dúvida (foto pouco nítida)
function mensagemDeDuvida(r) {
  return "🤔 Tenho só " + r.confianca + "% de certeza. Tenta outra foto, mais de perto!";
}

// Missão 6: quando a IA acerta
function mensagemDeAcerto(r) {
  return "🎉 Achei! É " + r.nome_popular + "! Que demais!";
}

// ----------------------------------------------------------------------------
//  DAQUI PARA BAIXO, NÃO MEXA. Esta linha entrega as missões para o
//  api/identificar.js usar.
// ----------------------------------------------------------------------------
module.exports = { GRUPO, ESPECIALISTA, O_QUE_PROCURAR, CERTEZA_MINIMA, conferirFoto, mensagemDeDuvida, mensagemDeAcerto };
