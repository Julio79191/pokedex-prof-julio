
const express = require("express");
const multer = require("multer");
const OpenAI = require("openai");

const app = express();
const PORTA = 3000;

// Configuração da IA — Missão 1
const ESPECIALISTA =
  "um especialista em plantas medicinais do Brasil";

// Missão 2
const O_QUE_PROCURAR = "plantas medicinais do Brasil";

// Missão 3
const CERTEZA_MINIMA = 50;

// Configuração para receber imagens
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10000000
  }
});

// Conexão com a IA
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Missão 4 — Validar a imagem
function conferirFoto(foto) {
  if (!foto.mimetype.startsWith("image/")) {
    return "📷 Isso não é uma foto! Envie uma imagem.";
  }

  if (foto.size > 10000000) {
    return "🐘 Imagem grande demais! Escolha outra.";
  }

  return "ok";
}

// Missão 5 — Mensagem de dúvida
function mensagemDeDuvida(r) {
  return (
    "🤔 Tenho só " +
    r.confianca +
    "% de certeza. Tente outra foto, mais de perto!"
  );
}

// Missão 6 — Mensagem de acerto
function mensagemDeAcerto(r) {
  return (
    "🎉 Achei! É " +
    r.nome_popular +
    "! Que demais!"
  );
}

// Rota principal do back-end
app.post(
  "/api/analisar",
  upload.single("foto"),
  async (req, res) => {
    try {
      // Verifica se uma imagem foi enviada
      if (!req.file) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "📷 Envie uma foto para começar!"
        });
      }

      // Valida o arquivo
      const validacao = conferirFoto(req.file);

      if (validacao !== "ok") {
        return res.status(400).json({
          sucesso: false,
          mensagem: validacao
        });
      }

      // Converte a imagem para envio à IA
      const imagemBase64 =
        req.file.buffer.toString("base64");

      const imagemUrl =
        `data:${req.file.mimetype};base64,${imagemBase64}`;

      // Solicita a análise da imagem
      const resposta = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              `Você é ${ESPECIALISTA}. ` +
              `Analise imagens para identificar ${O_QUE_PROCURAR}. ` +
              "Responda em JSON com os campos nome_popular, " +
              "confianca e encontrado. " +
              "confianca deve ser um número entre 0 e 100. " +
              "Se não houver uma planta medicinal identificável, " +
              "use encontrado=false e nome_popular=null. " +
              "Não invente identificações."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  "Identifique o conteúdo desta imagem. " +
                  "Retorne somente o JSON solicitado."
              },
              {
                type: "image_url",
                image_url: {
                  url: imagemUrl
                }
              }
            ]
          }
        ],
        response_format: {
          type: "json_object"
        }
      });

      // Interpreta o resultado
      const r = JSON.parse(
        resposta.choices[0].message.content
      );

      // Garante que a confiança seja válida
      if (
        typeof r.confianca !== "number" ||
        !Number.isFinite(r.confianca) ||
        r.confianca < 0 ||
        r.confianca > 100
      ) {
        return res.status(502).json({
          sucesso: false,
          mensagem: "Não foi possível validar a análise."
        });
      }

      // Verifica se a IA encontrou o tema
      if (
        r.encontrado !== true ||
        !r.nome_popular ||
        r.confianca < CERTEZA_MINIMA
      ) {
        return res.json({
          sucesso: false,
          mensagem: mensagemDeDuvida(r),
          resultado: r
        });
      }

      // Retorna o resultado ao front-end
      return res.json({
        sucesso: true,
        mensagem: mensagemDeAcerto(r),
        resultado: r
      });

    } catch (erro) {
      console.error("Erro na análise:", erro.message);

      return res.status(500).json({
        sucesso: false,
        mensagem:
          "Ocorreu um erro ao analisar a imagem. Tente novamente."
      });
    }
  }
);

// Inicia o servidor
app.listen(PORTA, () => {
  console.log(
    `Pokédex da Mata rodando em http://localhost:${PORTA}`
  );
});
