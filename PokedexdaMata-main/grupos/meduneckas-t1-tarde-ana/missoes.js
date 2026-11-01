// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo
// ============================================================================
//  Cópia do documento "Meu Back-End — Pokédex" que o grupo preencheu. O resto
//  do back-end (as chaves da IA, o revezamento, a conversa com o Google) mora
//  em api/identificar.js e é igual para todos.
//
//  Para conferir se ficou certo depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo=meduneckas-t1-tarde-ana
//
//  Ajustes feitos pela professora (o resto é como o grupo escreveu):
//   - Missões 4, 5 e 6: frases do grupo completadas para fazer sentido ("tenho uma pergunta 10 80% certeza" → "só tenho 10% de certeza").
//   - Missão 2: o grupo escreveu "inseto mais bonito do mundo é o pavão"; virou "inseto" para a IA conseguir procurar (pavão é uma ave).
// ============================================================================

// Quem é o grupo (aparece no painel)
const GRUPO = {
  nome: "Jujutsu",
  integrantes: "Saskhya, Ana, Maria Isadora e Guilherme",
  escola: "Meduneckas",
  turma: "Turma 1 - Tarde",
  tema: "insetos"
};

// Missão 1: quem a IA vai fingir ser
const ESPECIALISTA = "um entomologista ESPECIALISTA que ama insetos pequenos";

// Missão 2: o que procurar na foto
const O_QUE_PROCURAR = "inseto";

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: "porque tem vezes que a ia erra e não faz o que queremos"
const CERTEZA_MINIMA = 85;

// Missão 4: o porteiro
function conferirFoto(foto) {
  if (!foto.type.startsWith("image/")) return "😈 Essa imagem não era o que eu queria! Manda uma FOTO de inseto, muito mais bonito!";
  if (foto.size > 10000000) return "tá pequeno demais não dá para ver";
  return "ok";
}

// Missão 5: quando a IA fica em dúvida
function mensagemDeDuvida(r) {
  return "🤔 Tenho uma pergunta... só tenho " + r.confianca + "% de certeza! Tenta outra foto, mais de cima e com o inseto inteiro.";
}

// Missão 6: quando a IA acerta
function mensagemDeAcerto(r) {
  return "🎉 Encontrei! " + r.nome_popular + " ficou demais!!";
}

// ----------------------------------------------------------------------------
//  DAQUI PARA BAIXO, NÃO MEXA. Esta linha entrega as missões para o
//  api/identificar.js usar.
// ----------------------------------------------------------------------------
module.exports = { GRUPO, ESPECIALISTA, O_QUE_PROCURAR, CERTEZA_MINIMA, conferirFoto, mensagemDeDuvida, mensagemDeAcerto };
