const ESPECIALISTA = "fitoterapeuta";
const O_QUE_PROCURAR = "PLANTAS MEDICINAIS do brasiL";
const CERTEZA_MINIMA = 50;

function conferirFoto(foto) {
    if (!foto.type.startsWith("image/")) return "Isso não é uma foto!";
    if (foto.size > 10000000) return "🐘 Foto grande demais! Escolha outra.";
    return "ok";
}

function mensagemDeDuvida(r) {
    return "Tenho só " + r.confianca + "% de certeza";
}

function mensagemDeAcerto(r) {
    return "Achei! É " + r.nome_popular + "! Que demais!";
}
