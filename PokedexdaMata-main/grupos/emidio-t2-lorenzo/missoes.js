// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo
// ============================================================================
//  Cópia do documento "Meu Back-End — Pokédex" que o grupo preencheu. O resto
//  do back-end (as chaves da IA, o revezamento, a conversa com o Google) mora
//  em api/identificar.js e é igual para todos.
//
//  Para conferir se ficou certo depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo=emidio-t2-lorenzo
//
//  Ajustes feitos pela professora (o resto é como o grupo escreveu):
//   - Missão 6: usada a versão com ":" do arquivo "back end.docx" (o texto é o mesmo).
//   - A mensagem de foto grande fala em 5 MB, mas o porteiro (igual para todos) barra acima de 10 MB.
// ============================================================================

// Quem é o grupo (aparece no painel)
const GRUPO = {
  nome: "FaunaVision",
  integrantes: "Aysha, Lorenzo e Maria",
  escola: "Emídio",
  turma: "Turma 2",
  tema: "Mamíferos"
};

// Missão 1: quem a IA vai fingir ser
const ESPECIALISTA = "um mastozoólogo especialista em mamíferos do brasil";

// Missão 2: o que procurar na foto
const O_QUE_PROCURAR = "mamíferos";

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: "por que de 80 pra cima e um numero que a pessoa tem mais certeza, agora de 60 pra cima a pessoa ja pode esta com um pouco de duvida."
const CERTEZA_MINIMA = 60;

// Missão 4: o porteiro
function conferirFoto(foto) {
  if (!foto.type.startsWith("image/")) return "Ops! Esse arquivo não é uma foto. Certifique-se de escolher um arquivo de imagem válido antes de enviar.";
  if (foto.size > 10000000) return "Uau, que foto pesada! 📸 Nosso sistema não aguenta tanto tamanho. Por favor, envie uma versão menor (máx. 5 MB).";
  return "ok";
}

// Missão 5: quando a IA fica em dúvida
function mensagemDeDuvida(r) {
  return "Fiquei na dúvida! Tenho apenas " + r.confianca + "% de certeza do que é isso. Consegue mandar outra foto?";
}

// Missão 6: quando a IA acerta
function mensagemDeAcerto(r) {
  return "Identificado com sucesso: " + r.nome_popular + ". Confira os detalhes abaixo.";
}

// ----------------------------------------------------------------------------
//  DAQUI PARA BAIXO, NÃO MEXA. Esta linha entrega as missões para o
//  api/identificar.js usar.
// ----------------------------------------------------------------------------
module.exports = { GRUPO, ESPECIALISTA, O_QUE_PROCURAR, CERTEZA_MINIMA, conferirFoto, mensagemDeDuvida, mensagemDeAcerto };
