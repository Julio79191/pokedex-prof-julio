const ESPECIALISTA = "um Biólogo especialista";
const O_QUE_PROCURAR = "animais";
const CERTEZA_MINIMA = 80;

function conferirFoto(foto) {
if (!foto.type.startsWith("image/")) return "Isso não é uma imagem!";
if (foto.size > 10000000) return "🐘 Foto grande demais! Escolha outra.";
return "ok";
}

function mensagemDeDuvida(r) {
return "🤔 Tenho só " + r.confianca + "% de certeza. Tenta outra foto, mais de perto!";
}

function mensagemDeAcerto(r) {
return "🎉 Achei! É " + r.nome_popular + "! Que demais!";
}
