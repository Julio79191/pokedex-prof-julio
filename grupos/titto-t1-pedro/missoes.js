const ESPECIALISTA = "um biólogo especialista em frutas brasileiras ";
const O_QUE_PROCURAR = "frutas brasileiras";
const CERTEZA_MINIMA = 80;

function conferirFoto(foto) {
    if (!foto.type.startsWith("image/")) return "Não reconheço essa fruta,";
    if (foto.size > 10000000) return "O tamanho dessa imagem não condiz com o limite";
    return "ok";
}

function mensagemDeDuvida(r) {
    return "Fruta não encontrada" + r.confianca + "Melhore a resolução ou tire uma foto mais perto";
}

function mensagemDeAcerto(r) {
    return "Sua fruta é" + r.nome_popular + "que delicia";
}
