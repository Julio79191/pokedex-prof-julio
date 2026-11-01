// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo
// ============================================================================
//  Cópia do documento "Meu Back-End — Pokédex" que o grupo preencheu. O resto
//  do back-end (as chaves da IA, o revezamento, a conversa com o Google) mora
//  em api/identificar.js e é igual para todos.
//
//  Para conferir se ficou certo depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo=cavazza-t2-eduardo
//
//  Ajustes feitos pela professora (o resto é como o grupo escreveu):
//   - O grupo não entregou o documento do back-end: as 6 missões foram preenchidas pela professora para o app funcionar.
//   - O álbum guardava a foto em tamanho original e enchia o espaço do navegador: agora guarda uma versão menor.
//   - Escritas pela professora (estavam em branco ou incompletas no documento): Missão 1, Missão 2, Missão 3, Nome do grupo e integrantes, Missão 4 (mensagem de não é foto), Missão 4 (mensagem de foto grande), Missão 5, Missão 6.
// ============================================================================

// Quem é o grupo (aparece no painel)
const GRUPO = {
  nome: "As Frutas Brasileiras",
  integrantes: "Eduardo",
  escola: "Cavazza",
  turma: "Turma 2",
  tema: "Frutas brasileiras"
};

// Missão 1: quem a IA vai fingir ser
const ESPECIALISTA = "um especialista em frutas brasileiras";

// Missão 2: o que procurar na foto
const O_QUE_PROCURAR = "frutas brasileiras";

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: "(definido pela professora)"
const CERTEZA_MINIMA = 80;

// Missão 4: o porteiro
function conferirFoto(foto) {
  if (!foto.type.startsWith("image/")) return "🦊 A raposa olhou e… isso não é uma foto! Mande a foto de uma fruta.";
  if (foto.size > 10000000) return "🍉 Essa foto é grande demais até pra raposa carregar! Escolha uma menor.";
  return "ok";
}

// Missão 5: quando a IA fica em dúvida
function mensagemDeDuvida(r) {
  return "🦊 A raposa ficou com só " + r.confianca + "% de certeza… tente uma foto com mais luz!";
}

// Missão 6: quando a IA acerta
function mensagemDeAcerto(r) {
  return "🦊 A raposa descobriu: é " + r.nome_popular + "! Que fruta brasileira demais!";
}

// ----------------------------------------------------------------------------
//  DAQUI PARA BAIXO, NÃO MEXA. Esta linha entrega as missões para o
//  api/identificar.js usar.
// ----------------------------------------------------------------------------
module.exports = { GRUPO, ESPECIALISTA, O_QUE_PROCURAR, CERTEZA_MINIMA, conferirFoto, mensagemDeDuvida, mensagemDeAcerto };
