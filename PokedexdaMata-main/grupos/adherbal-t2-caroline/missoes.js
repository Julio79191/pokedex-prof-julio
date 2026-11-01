// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo
// ============================================================================
//  Cópia do documento "Meu Back-End — Pokédex" que o grupo preencheu. O resto
//  do back-end (as chaves da IA, o revezamento, a conversa com o Google) mora
//  em api/identificar.js e é igual para todos.
//
//  Para conferir se ficou certo depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo=adherbal-t2-caroline
//
//  Ajustes feitos pela professora (o resto é como o grupo escreveu):
//   - Missão 6: só foi colocado um "!" depois do nome da fruta, para a frase não ficar emendada.
//   - Front usado: FrutAI_visual_vibrante.html (a versão mais nova; frutAi_tela_corrigida.html e o "Documento sem título" ficaram de fora).
//   - Escritas pela professora (estavam em branco ou incompletas no documento): Missão 3 (por que escolheram 60).
// ============================================================================

// Quem é o grupo (aparece no painel)
const GRUPO = {
  nome: "FrutAI",
  integrantes: "Caroline, Manuela, Pedro e Erick",
  escola: "Adherbal",
  turma: "Turma 2",
  tema: "Frutas brasileiras"
};

// Missão 1: quem a IA vai fingir ser
const ESPECIALISTA = "um fruticultor especialista_em frutas brasileiras";

// Missão 2: o que procurar na foto
const O_QUE_PROCURAR = "frutas do brasil";

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: ""
const CERTEZA_MINIMA = 60;

// Missão 4: o porteiro
function conferirFoto(foto) {
  if (!foto.type.startsWith("image/")) return "Opa! Parece que você não enviou uma foto, poderia tentar enviar uma imagem dessa vez?";
  if (foto.size > 10000000) return "Vish! Essa foto é grande demais pra eu analisar, manda outra!!";
  return "ok";
}

// Missão 5: quando a IA fica em dúvida
function mensagemDeDuvida(r) {
  return "Eita! Fiquei com " + r.confianca + "% de certeza, você pode mandar uma foto melhor?";
}

// Missão 6: quando a IA acerta
function mensagemDeAcerto(r) {
  return "Com certeza é um(a) " + r.nome_popular + "! Achei muito legal!!";
}

// ----------------------------------------------------------------------------
//  DAQUI PARA BAIXO, NÃO MEXA. Esta linha entrega as missões para o
//  api/identificar.js usar.
// ----------------------------------------------------------------------------
module.exports = { GRUPO, ESPECIALISTA, O_QUE_PROCURAR, CERTEZA_MINIMA, conferirFoto, mensagemDeDuvida, mensagemDeAcerto };
