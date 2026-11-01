const ESPECIALISTA = "um herpetólogo especialista";
const O_QUE_PROCURAR = "répteis e anfíbios do brasil";
const CERTEZA_MINIMA = 77;

function conferirFoto(foto) {
    if (!foto.type.startsWith("image/")) return "Brutal você não sabe oque é uma imagem? coloque uma imagem pra funcionar.";
    if (foto.size > 10000000) return "sua imagem esta parecendo o tatsumi na forma Tyrant.Troque pra uma imagem menor.";
    return "ok";
}

function mensagemDeDuvida(r) {
    return "não consegui " + r.confianca + "o jackpot não veio ainda,tente outra foto.";
}

function mensagemDeAcerto(r) {
    return "achei!É" + r.nome_popular + "Volume 1 pag 177 1 balão de fala de call of the night";
}
