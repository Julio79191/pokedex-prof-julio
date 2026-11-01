const ESPECIALISTA = "biologo especialista em mamiferos";
const O_QUE_PROCURAR = "animais mamiferos do BRASIL";
const CERTEZA_MINIMA = 85;

function conferirFoto(foto) {
  if (!foto.type.startsWith("image/")) return "Isso não é uma foto!";
  if (foto.size > 10000000) return "foto grande demais! Escolha outra.";
  return "ok";
}

function mensagemDeDuvida(r) {
  return "Tenho só " + r.confianca + "% de certeza. Tenta outra foto";
}

function mensagemDeAcerto(r) {
  return "achei é " + r.nome_popular + "% de certeza. Que demais";
}
