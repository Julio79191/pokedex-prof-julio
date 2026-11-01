# 🌿 Pokédex da Mata

Projetos dos alunos do curso de **Inteligência Artificial (2026)**: cada grupo criou uma Pokédex que **reconhece espécies da natureza por foto** (aves, flores, frutas, árvores, insetos, mamíferos…) usando a IA **Google Gemini**.

Este repositório publica **um site só**, com um **painel** na página inicial e **uma Pokédex para cada grupo**, sem gastar nada.

---

## ✨ O que cada Pokédex faz

- 📷 **Tira a foto** (câmera do tablet/celular ou webcam do computador) ou escolhe da galeria;
- 🤖 **Reconhece a espécie** com a IA, usando as **6 missões** que o grupo escreveu no documento *"Meu Back-End — Pokédex"*;
- 🗂️ Mostra a **ficha padrão** em um pop-up no meio da tela: nome popular e científico, curiosidades, **mapa dos biomas e regiões** do Brasil e o **habitat** com o ícone do tema, nas cores do grupo;
- 🚫 Avisa quando a foto **não é do tema** ("isso parece ser uma melancia, e aqui a gente só reconhece flores"), quando a IA ficou em **dúvida** (foto pouco nítida) e quando o arquivo **não é uma foto**;
- 💾 Guarda as descobertas no **álbum** do grupo;
- 📱 Funciona bem no **tablet** (deitado e em pé), no celular e no computador.

O visual, as telas, os jogos e as ideias de cada Pokédex são dos alunos. 💚

---

## 🗺️ Como o projeto está organizado

```
├── index.html            ← PAINEL: lista todos os grupos (página inicial)
├── api/
│   └── identificar.js    ← BACK-END: guarda as chaves e fala com o Gemini (igual para todos)
├── comum/
│   ├── ficha.js          ← a ficha de resultado padrão, em pop-up
│   └── adaptador.js      ← liga o front de cada grupo à ficha e ao back-end
├── grupos/
│   └── <escola>-<turma>-<lider>/
│       ├── index.html    ← o front que o grupo fez
│       └── missoes.js    ← as 6 missões do grupo (o back-end dele)
├── modelo/               ← modelos em branco para um grupo novo
├── ferramentas/          ← scripts opcionais para montar muitos grupos
├── vercel.json           ← leva as missões junto com o back-end no Vercel
└── .vercelignore         ← o que NÃO vai para o site
```

```
  Aluno tira a foto ──▶ grupos/<grupo>/index.html ──▶ /api/identificar ──▶ Google Gemini
                                     ▲                       │  (missões do grupo
                                     └──── ficha em pop-up ◀─┘   + chave secreta)
```

> 🔑 A chave da IA **nunca** aparece no código nem no navegador: ela fica guardada no Vercel, e só o back-end a usa.

---

## 🚀 Publicar (resumo)

1. Crie de 3 a 5 chaves no **[Google AI Studio](https://aistudio.google.com)**, **cada uma num projeto diferente**.
2. No **[Vercel](https://vercel.com)**: **Add New → Project** → importe este repositório → Framework **Other**.
3. Em **Environment Variables**: `GEMINI_API_KEY` = as chaves separadas por vírgula (`chave1,chave2,chave3`).
4. **Deploy.** Pronto: o painel abre no endereço do projeto.

O passo a passo completo, com onde clicar em cada tela, problemas comuns e como colocar grupos novos, está no **[📘 Guia para professores](GUIA-PROFESSORES.md)**.

---

## ✅ Conferir

| Endereço | O que mostra |
|---|---|
| `/` | O painel com todos os grupos, com **filtro por escola** |
| `/grupos/<grupo>/` | A Pokédex do grupo |
| `/api/identificar` | O diagnóstico: as missões de todos os grupos e quantas chaves o servidor enxerga |
| `/api/identificar?grupo=<grupo>` | O diagnóstico de um grupo só |

---

## 📚 Documentos

| Documento | Para quem |
|---|---|
| [📘 GUIA-PROFESSORES.md](GUIA-PROFESSORES.md) | Professores que vão montar a Pokédex das suas turmas: chaves, GitHub, Vercel, como usar o front e o documento dos alunos |
| [📋 RELATORIO-GRUPOS.md](RELATORIO-GRUPOS.md) | O que foi feito em cada grupo e o que falta completar com os alunos |
| [🧰 ferramentas/LEIA-ME.md](ferramentas/LEIA-ME.md) | Scripts opcionais para montar muitos grupos de uma vez |

---

## 🔒 Privacidade

O site é público. Por isso, só aparece o **primeiro nome** dos alunos. Os arquivos originais entregues pelos grupos (que tinham nomes completos) foram **removidos do repositório e de todo o histórico**.

---

Licença: veja [LICENSE](LICENSE).
