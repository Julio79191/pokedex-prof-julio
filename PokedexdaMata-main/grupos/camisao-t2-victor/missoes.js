// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo
// ============================================================================
//  Cópia do documento "Meu Back-End — Pokédex" que o grupo preencheu. O resto
//  do back-end (as chaves da IA, o revezamento, a conversa com o Google) mora
//  em api/identificar.js e é igual para todos.
//
//  Para conferir se ficou certo depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo=camisao-t2-victor
//
//  Ajustes feitos pela professora (o resto é como o grupo escreveu):
//   - Mensagens das missões: as frases do grupo ganharam acentos, pontuação, o "%" e um emoji, para fazer sentido para quem lê (as palavras são as do grupo).
//   - Missões 1, 2 e 6: só ajustes de escrita ("em", vírgula e pontuação); as ideias são do grupo.
//   - O álbum guardava a foto de cada ave e podia encher o espaço do navegador: agora guarda só os dados (o álbum desenha a ave, não usa a foto).
//   - Corrigido um erro do front: faltava criar STATS_KEY e PROFILE_KEY (a tela de Perfil e as Conquistas de som não funcionavam).
//   - Escritas pela professora (estavam em branco ou incompletas no documento): Missão 3 (por que escolheram 80).
// ============================================================================

// Quem é o grupo (aparece no painel)
const GRUPO = {
  nome: "PassaroDex",
  integrantes: "Victor, Henzo e Lara",
  escola: "Camisão",
  turma: "Turma 2",
  tema: "Aves do Brasil"
};

// Missão 1: quem a IA vai fingir ser
const ESPECIALISTA = "um ornitólogo especialista em aves do Brasil";

// Missão 2: o que procurar na foto
const O_QUE_PROCURAR = "aves brasileiras";

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: ""
const CERTEZA_MINIMA = 80;

// Missão 4: o porteiro
function conferirFoto(foto) {
  if (!foto.type.startsWith("image/")) return "🦅 Você mandou a imagem errada: isso não é uma foto!";
  if (foto.size > 10000000) return "🦅 A foto está do tamanho de um gavião! Escolha uma menor.";
  return "ok";
}

// Missão 5: quando a IA fica em dúvida
function mensagemDeDuvida(r) {
  return "🤔 Tenho só " + r.confianca + "% de certeza. Tenta outra foto, mais de perto!";
}

// Missão 6: quando a IA acerta
function mensagemDeAcerto(r) {
  return "🎉 Boa, eu achei: " + r.nome_popular + "! Que top!";
}

// ----------------------------------------------------------------------------
//  DAQUI PARA BAIXO, NÃO MEXA. Esta linha entrega as missões para o
//  api/identificar.js usar.
// ----------------------------------------------------------------------------
module.exports = { GRUPO, ESPECIALISTA, O_QUE_PROCURAR, CERTEZA_MINIMA, conferirFoto, mensagemDeDuvida, mensagemDeAcerto };
