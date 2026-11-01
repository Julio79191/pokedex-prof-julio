# 📘 Guia para professores — montando a Pokédex da Mata das suas turmas

Este guia é para você, professor(a), repetir com os seus grupos o que foi feito neste repositório: **um site só, com um painel e uma Pokédex para cada grupo**, todas reconhecendo espécies por foto com a IA Gemini, **de graça**.

> ⏱️ **Tempo:** a primeira vez leva umas 2 horas (chaves + repositório + Vercel). Depois disso, cada grupo leva de 10 a 30 minutos, dependendo de como está o front.

---

## Sumário

1. [Como tudo funciona (visão geral)](#1-como-tudo-funciona)
2. [Criar as chaves do Gemini](#2-criar-as-chaves-do-gemini)
3. [Montar o seu repositório no GitHub](#3-montar-o-seu-repositório-no-github)
4. [Colocar um grupo (usando as informações dos alunos)](#4-colocar-um-grupo)
5. [Publicar no Vercel](#5-publicar-no-vercel)
6. [Conferir se está tudo certo](#6-conferir-se-está-tudo-certo)
7. [No dia da apresentação (tablet)](#7-no-dia-da-apresentação)
8. [Problemas comuns e soluções](#8-problemas-comuns-e-soluções)
9. [Privacidade dos alunos](#9-privacidade-dos-alunos)

---

## 1. Como tudo funciona

```
                     https://SEU-PROJETO.vercel.app
                                  │
          ┌───────────────────────┼─────────────────────────┐
          ▼                       ▼                         ▼
     index.html          grupos/<grupo>/index.html     api/identificar.js
     (o PAINEL)          (a Pokédex do grupo)          (o back-end, igual p/ todos)
   lista os grupos,      o front que os alunos         lê grupos/<grupo>/missoes.js,
   mostra ✅ / ⚠️          fizeram + a ficha padrão      guarda as CHAVES e fala
                         em pop-up (comum/)            com o Google Gemini
```

| Peça | O que é | Você mexe? |
|---|---|---|
| `index.html` | O **painel**: a página inicial, com todos os grupos | ❌ Não. Ele lê as pastas sozinho |
| `api/identificar.js` | O **back-end**: o "garçom" que guarda as chaves da IA | ❌ Não |
| `comum/ficha.js` | A **ficha de resultado padrão** (nome, curiosidades, mapa dos biomas, habitat), em pop-up | ❌ Não |
| `comum/adaptador.js` | Liga **qualquer** front de aluno à ficha e ao back-end | ❌ Não |
| `grupos/<grupo>/index.html` | O **front do grupo** | ✅ Você cola o front e 3 linhas no final |
| `grupos/<grupo>/missoes.js` | As **6 missões** do documento "Meu Back-End — Pokédex" | ✅ Você preenche |
| `vercel.json` e `.vercelignore` | Configuração do Vercel | ❌ Não |
| `modelo/` | Modelos em branco para copiar | 📋 Só copia |

**Por que um projeto só, e não um por grupo?** Porque assim você configura as chaves **uma vez**, publica **uma vez**, e todos os grupos funcionam. Grupo novo = pasta nova. O painel encontra sozinho.

---

## 2. Criar as chaves do Gemini

A chave é a "senha" que deixa o site usar a IA. Ela **nunca** vai no código: fica guardada no Vercel.

### O segredo das várias chaves 🔑

O plano gratuito do Gemini tem um limite de uso **por projeto do Google** (não por chave). Então:

- ❌ 5 chaves no **mesmo** projeto = o mesmo limite (não adianta nada);
- ✅ 5 chaves, **cada uma num projeto diferente** = 5 limites separados.

O back-end usa a primeira chave; quando ela bate no limite, ele **passa sozinho para a próxima**. Na sala, com 30 alunos tirando foto ao mesmo tempo, isso faz muita diferença.

### Passo a passo

1. Use uma **conta Gmail pessoal** (contas de escola costumam ter o AI Studio bloqueado).
2. Abra **[aistudio.google.com](https://aistudio.google.com)** e aceite os termos.
3. Vá em **Get API key** → **Create API key** → **Create API key in new project**.
4. Copie a chave (começa com `AIza...`) e guarde num lugar seguro.
5. Repita os passos 3 e 4 **sempre escolhendo "new project"**, até ter de 3 a 5 chaves.

> 💡 **Quantas?** 3 a 5 chaves dão conta de uma turma inteira usando junto. Cada professor cria as **suas** chaves para o **seu** projeto.

> ⚠️ **Nunca** coloque a chave no `index.html`, no `missoes.js`, no GitHub, no Drive ou em print. Se vazou, apague a chave no AI Studio e crie outra.

---

## 3. Montar o seu repositório no GitHub

1. Neste repositório, clique em **Code → Download ZIP** e descompacte.
2. Apague o conteúdo da pasta `grupos/` (são os grupos da professora Mayara) e as pastas das escolas, se ainda existirem.
3. Fica assim:

   ```
   seu-repositorio/
   ├── index.html
   ├── vercel.json
   ├── .vercelignore
   ├── api/identificar.js
   ├── comum/ficha.js
   ├── comum/adaptador.js
   ├── modelo/              (modelos em branco)
   ├── ferramentas/         (opcional: scripts para muitos grupos)
   └── grupos/              (vazia por enquanto)
   ```

4. No GitHub: **New repository** → um nome como `pokedex-prof-seunome` → **Create**.
5. **uploading an existing file** → arraste **o conteúdo** da pasta (não a pasta de fora) → **Commit changes**.

> 💡 O arquivo `.vercelignore` começa com ponto e pode ficar escondido no seu computador. Se ele não subir, crie-o no GitHub (**Add file → Create new file**) com o mesmo conteúdo.

---

## 4. Colocar um grupo

Para cada grupo você precisa de **duas coisas** dos alunos:

- 📄 o **front** (o `index.html` que eles fizeram, às vezes com outro nome);
- 📝 o documento **"Meu Back-End — Pokédex"** com as 6 missões.

### 4.1 Escolha o apelido da pasta

Formato: `escola-turma-lider`, tudo **minúsculo, sem acento e sem espaço**.

| Grupo | Apelido |
|---|---|
| Escola Camisão, Turma 2 - Manhã, líder Lucas | `camisao-t2m-lucas` |
| Escola Emídio, Turma 1, líder Arthur | `emidio-t1-arthur` |

Crie a pasta `grupos/<apelido>/`.

### 4.2 Preencha o `missoes.js` (o back-end do grupo)

Copie `modelo/missoes.js` para `grupos/<apelido>/missoes.js` e passe as respostas do documento:

| No documento do grupo | No `missoes.js` |
|---|---|
| Tabela: nome do grupo, integrantes, tema | `GRUPO = { nome, integrantes, tema, ... }` (**só primeiro nome!**) |
| Missão 1: quem a IA vai fingir ser | `const ESPECIALISTA = "..."` |
| Missão 2: o que procurar | `const O_QUE_PROCURAR = "..."` |
| Missão 3: quanta certeza (número) | `const CERTEZA_MINIMA = 80;` (**sem aspas**) |
| Missão 4: as duas mensagens do porteiro | os dois `return "..."` de `conferirFoto` |
| Missão 5: a mensagem de dúvida | `mensagemDeDuvida` |
| Missão 6: a mensagem de acerto | `mensagemDeAcerto` |

**O que fazer quando o documento veio…**

- **Com uma missão em branco** → deixe o exemplo do modelo e escreva em `pendencias` (ex.: `["Missão 5"]`). Ela aparece em amarelo no painel, para você completar com o grupo depois.
- **Sem documento nenhum** → preencha você, seguindo a ideia do front (o tema, a "personagem" do app), e coloque todas as missões em `pendencias`.
- **Com erro de digitação ou tema trocado** (ex.: "ornitólogo especialista em frutas") → corrija o mínimo e anote no topo do arquivo o que mudou, para conversar com o grupo.
- **Com o nome completo de alguém** → troque pelo primeiro nome ou tire.

**Como o app usa as missões** (bom para explicar aos alunos):

| Situação | O que aparece |
|---|---|
| Arquivo que não é foto | Missão 4 (porteiro) |
| A foto é de outra coisa (ex.: melancia num app de flores) | Mensagem automática: *"🚫 Não reconhecemos porque isso parece ser uma melancia, e aqui a gente só reconhece flores."* |
| A foto é do tema, mas a IA ficou com pouca certeza (foto tremida, longe) | Missão 5 (dúvida) |
| Acertou | Missão 6 + a ficha completa |

### 4.3 Coloque o front do grupo

1. Copie o front dos alunos para `grupos/<apelido>/index.html`.
2. Abra `modelo/ligar-no-front.html`, copie o bloco e **cole no final do `index.html` do grupo, logo antes do `</body>`**.
3. Ajuste no bloco:
   - `icone`, `cor`, `cor2` → o emoji e as cores do front (procure no `<style>` do grupo por algo como `--verde: #4f8f5b`);
   - `escuro` → `() => true` se o front é escuro, `() => false` se é claro;
   - `esconder` → o resultado **antigo** do front, para não aparecer duas vezes (geralmente `#result` ou `#resultado`);
   - `salvar` → o que o botão **"💾 Salvar no álbum"** do pop-up faz (normalmente: clicar no botão de salvar dos alunos e abrir a aba do álbum). Se o front não tem álbum, apague a linha;
   - `novaFoto` → o que o botão **"🔍 Reconhecer outra"** faz (normalmente: abrir a escolha de foto).

> 💡 Não sabe o `id` de um botão? Abra o `index.html` do grupo e procure (Ctrl+F) pelo texto do botão, por exemplo `Salvar`. O `id="..."` está ali do lado.

**Só isso já garante, em todos os grupos:**

- ✅ a **ficha padrão** em pop-up no meio da tela, com o **X** para fechar: nome, curiosidades, **mapa dos biomas/regiões** e **habitat** com o ícone do tema, nas cores do grupo (modo claro e escuro);
- ✅ "procurando…", dúvida, fora do tema e erros também em pop-up;
- ✅ o **porteiro** (Missão 4) funcionando;
- ✅ fotos grandes de celular diminuídas antes de enviar;
- ✅ no computador, o botão de câmera abre a **webcam** (com a opção de escolher arquivo).

### 4.4 Arrumações comuns no front dos alunos

| Se o front… | Faça |
|---|---|
| chama `fetch("/api/identificar", ...)` | Nada! É o normal: o adaptador cuida do resto |
| chama o Gemini **direto** (com chave no código!) | Apague a chave e troque a chamada por `fetch("/api/identificar", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ modelo: "gemini-3.6-flash", mime: "image/jpeg", imagem: base64 }) })` |
| usa um modelo antigo (`gemini-1.5`, `gemini-2.0`, `gemini-2.5`…) | Nada: o adaptador troca pelo modelo atual sozinho |
| não tem reconhecimento nenhum (só catálogo) | Crie uma seção "Descobrir pela foto" com um `<input type="file" accept="image/*" capture="environment">` e a chamada acima (veja `grupos/camisao-t2m-sther` como exemplo) |
| tem **um botão só** de foto, ligado a um campo com `capture` (no tablet ele só abre a câmera, sem galeria) | No bloco do passo 4.3, adicione `galeria: { depoisDe: "#idDoBotaoDeFoto", input: "#idDoCampo" }`: aparece um botão "🖼️ Galeria" com a mesma cara do botão do grupo |
| tem um botão "Galeria" que clica no campo da **câmera** | Troque o `onclick` dele por `FichaPokedex.escolherArquivo(f => { ... })` (veja `grupos/emidio-t1-vitor`) |
| tem um "mapa" que é só desenho ou imagem borrada | Troque por `<div id="meuMapa"></div>` e chame `FichaPokedex.mapaBiomas(document.getElementById("meuMapa"))`: é o mapa de verdade dos biomas (veja `grupos/emidio-t2-lorenzo`) |
| fica pequeno ou desalinhado no tablet | Coloque um `<style id="ajustes-tablet">` no fim da página com os ajustes (todos os grupos deste repositório têm um, de exemplo). Teste o tablet deitado **e** em pé |
| guarda a **foto inteira** no álbum (`localStorage`) | Diminua antes de guardar (veja a função `reduzirParaAlbum` em `grupos/cavazza-t2-eduardo`). Sem isso, o álbum para de salvar depois de 1 ou 2 fotos |
| tem imagens do Google borradas ou erradas | Troque por `<img data-especie="Nome científico">` e chame `FichaPokedex.trocarFotos()`: a página busca a foto certa da espécie na Wikipédia |
| tem imagens embutidas de vários MB | Diminua (ou use `ferramentas/montar.py`, que faz isso sozinho) |

> 🧰 **Muitos grupos?** A pasta `ferramentas/` tem scripts que leem o `.docx` do grupo, geram o `missoes.js` e montam o `index.html` sozinhos. Veja `ferramentas/LEIA-ME.md`.

### 4.5 Suba no GitHub

No repositório: **Add file → Upload files** → arraste a pasta do grupo → **Commit changes**. Se o projeto já está no Vercel, ele publica sozinho em 1 minuto.

---

## 5. Publicar no Vercel

1. Entre em **[vercel.com](https://vercel.com)** com a sua conta do GitHub.
2. **Add New… → Project** → escolha o seu repositório → **Import**.
3. **Framework Preset:** `Other`. Não mude mais nada.
4. Abra **Environment Variables** e adicione:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** as suas chaves **separadas por vírgula**, sem espaço: `AIzaChave1,AIzaChave2,AIzaChave3`
5. **Deploy** e espere ficar verde. 🎉

**Depois:**

- Cada vez que você sobe algo no GitHub, o Vercel publica sozinho.
- Se você **mudar as chaves**, precisa republicar: **Deployments** → nos `⋯` do último → **Redeploy**.
- Para mudar o endereço: **Settings → Domains** (ex.: `pokedex-prof-seunome.vercel.app`).

**Opções avançadas** (variáveis extras, só se precisar):

| Variável | Para quê |
|---|---|
| `GEMINI_MODELO` | Força um modelo para todos os grupos (útil quando o Google aposenta um) |
| `GEMINI_MODELO_RESERVA` | O modelo usado quando todas as chaves batem no limite (padrão: `gemini-3.5-flash-lite`) |

---

## 6. Conferir se está tudo certo

### O painel

Abra `https://SEU-PROJETO.vercel.app/`. Cada grupo aparece com:

- ✅ **pronto**, ou ⚠️ **falta arrumar** (com o motivo em vermelho);
- 🟡 **"Completar com o grupo: …"** → as pendências que você anotou.

### O diagnóstico

- `https://SEU-PROJETO.vercel.app/api/identificar` → todos os grupos + quantas chaves o servidor enxerga (**só a quantidade**, nunca a chave).
- `https://SEU-PROJETO.vercel.app/api/identificar?grupo=<apelido>` → um grupo só.

Se aparecer "❌ Nenhuma chave": a variável `GEMINI_API_KEY` não foi salva ou você não fez o **Redeploy**.

### O grande teste (em cada Pokédex)

| Teste | Tem que aparecer |
|---|---|
| 📸 Foto do tema (ex.: uma flor num app de flores) | A ficha completa + a mensagem da Missão 6 |
| 🍉 Foto de outra coisa | "🚫 Não reconhecemos porque isso parece ser…" |
| 🌫️ Foto do tema, mas tremida ou muito longe | A mensagem da Missão 5 (dúvida) |
| 📄 Um arquivo que não é foto (PDF, texto) | A mensagem da Missão 4 (porteiro) |
| 💾 "Salvar no álbum" | Vai para a aba do álbum, com a espécie lá |

> No computador, para escolher um arquivo que não é foto: na janela de escolher arquivo, troque o filtro para **"Todos os arquivos"**.

---

## 7. No dia da apresentação

- 📱 **Tablet/celular:** o botão de câmera abre a câmera traseira. Precisa estar no endereço `https://...vercel.app` (a câmera não abre em arquivo local).
- 💻 **Computador:** abre a webcam; se não houver, aparece "📁 Escolher arquivo".
- 🔁 Muitos alunos ao mesmo tempo e apareceu "muita gente usando"? Espere uns segundos: o back-end tenta de novo e troca de chave sozinho.
- 🗺️ O mapa e as fotos das espécies vêm da internet (OpenStreetMap e Wikipédia): teste na rede da escola antes, porque algumas redes bloqueiam esses sites.

---

## 8. Problemas comuns e soluções

| Problema | Causa provável | Solução |
|---|---|---|
| Painel vazio ou "Carregando…" para sempre | O back-end não publicou | Veja **Deployments** no Vercel: se está vermelho, abra o log |
| Grupo com ⚠️ "tem um erro de digitação" | Faltou aspas, vírgula ou parêntese, ou as aspas são curvas (“ ”) | O painel explica o erro; confira o `missoes.js` com o modelo, aspas retas (") |
| "❌ Nenhuma chave" no diagnóstico | Variável não salva ou sem Redeploy | Passo 5 + Redeploy |
| "Todas as chaves… estão sem cota agora" o tempo todo | Chaves do **mesmo** projeto, ou poucas chaves para a turma | Crie as chaves em projetos **diferentes** (passo 2) |
| O pop-up aparece, mas o resultado antigo do grupo também | Faltou o `esconder` | Coloque o `id` do resultado antigo em `esconder` |
| "Salvar no álbum" não faz nada | `salvar` aponta para um `id` que não existe | Confira o `id` do botão de salvar do grupo |
| O álbum salva 1 foto e depois para | O front guarda a foto inteira no navegador | Diminua a foto antes de guardar (seção 4.4) |
| Página do grupo dá 404 | Nome da pasta com acento, espaço ou maiúscula | Renomeie a pasta no formato `escola-t1-lider` |
| A câmera não abre | Página aberta como arquivo local ou permissão negada | Abra pelo link do Vercel e permita a câmera |

---

## 9. Privacidade dos alunos

- 🔒 O site é **público**: no painel e nos `missoes.js`, use **só o primeiro nome** dos alunos.
- 📁 Os arquivos originais (documentos com nome completo) **não** devem ir para o site. Se precisar deixá-los no repositório por um tempo, liste as pastas no `.vercelignore` (assim o Vercel não publica) e **apague quando terminar**.
- 🔑 Chave **nunca** no código. O `api/identificar.js` lê a chave do Vercel e só mostra quantas existem.
- 💡 Se quiser, deixe o repositório do GitHub como **privado** (**Settings → General → Danger Zone → Change visibility**). O Vercel continua funcionando normalmente.

---

Ficou alguma dúvida? Veja os grupos prontos em `grupos/` como exemplo: cada `missoes.js` tem, no topo, o que foi ajustado e por quê. 🌿
