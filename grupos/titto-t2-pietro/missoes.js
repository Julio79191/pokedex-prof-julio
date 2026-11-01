const ESPECIALISTA = "BOTÂNICO";
const O_QUE_PROCURAR = "PLANTAS" do BRASIL";
const CERTEZA_MINIMA = 60;

function conferirFoto(foto) {
    if (!foto.type.startsWith("image/")) return "Essa foto não é compatível";
    if (foto.size > 10000000) return "Essa imagem grande demais";
    return "ok";
}

function mensagemDeDuvida(r) {
    return "Tenho apenas" + r.confianca + "de confiança sobre essa planta";
}

function mensagemDeAcerto(r) {
    return "Você achou " + r.nome_popular + "Incrível!";
}
