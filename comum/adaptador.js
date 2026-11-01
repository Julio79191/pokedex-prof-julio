/* ============================================================================
   ADAPTADOR DA POKÉDEX  —  liga QUALQUER front de aluno à ficha padrão
   ============================================================================
   Cada grupo fez o seu front do seu jeito. Este arquivo encaixa em todos sem
   precisar reescrever o código dos alunos:

   1) Quando o front pede à IA (fetch para /api/identificar), o adaptador:
      - avisa o back-end de qual grupo é a foto e o tipo/tamanho do arquivo
        (para o porteiro, Missão 4, funcionar);
      - diminui a foto se ela for grande demais para o servidor;
      - mostra o POP-UP padrão: "procurando…", a ficha, a dúvida, o "não é do
        tema" ou o erro (tudo de comum/ficha.js);
      - devolve a resposta ao front, para o álbum, os pontos e as medalhas
        dos alunos continuarem funcionando.
   2) Se o aluno escolher um arquivo que NÃO é foto, o adaptador chama o
      porteiro do grupo na hora (o "grande teste" do documento das missões).
   3) No computador, o botão de câmera abre a webcam.
   4) Opcional: um botão "🖼️ Galeria" ao lado do botão de foto do grupo.
   5) Opcional: um álbum pronto (album: { el, depois }) para quem não tem álbum.
   6) Opcional: botões por etapa (etapas: { inicio, camera, foto, ... }).

   COMO USAR (no fim do index.html do grupo):
     <script src="/comum/ficha.js"></script>
     <script src="/comum/adaptador.js"></script>
     <script>
       PokedexAdaptador.iniciar({
         icone: "🐦", cor: "#48d9ff", cor2: "#a78bfa",
         escuro: () => true,                      // ou uma função do tema do front
         claro: {...}, noturno: {...},             // cores da ficha (opcional)
         esconder: ["#result"],                    // resultado antigo do front
         extras: info => [["🔊 Som", info.som]],    // campos do grupo na ficha
         alerta: info => info.perigoso ? info.aviso_perigo : "",
         salvar: info => document.getElementById("albumBtn").click(),
         acoesExtras: info => [{ texto: "🔊 Ouvir", fechar: false, aoClicar: () => ... }],
         novaFoto: () => document.getElementById("newPhotoBtn").click()
       });
     </script>
   ========================================================================== */
(function () {
  "use strict";

  const GRUPO = (location.pathname.match(/\/grupos\/([^/]+)/) || [])[1] || "";
  const CFG = { esconder: [], extras: null, alerta: null, salvar: null, novaFoto: null, carregando: "🔎 Procurando pistas…", limiarFront: 85 };
  let ultimoArquivo = null;

  const ehImagem = f => !!f && (f.type || "").startsWith("image/");
  const ehIdentificar = url => /\/api\/identificar(\?|$)/.test(String(url && url.url ? url.url : url));

  /* Lê um arquivo de imagem e devolve uma versão reduzida (data URL JPEG). */
  function reduzir(src, ladoMax, qualidade) {
    return new Promise(res => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, ladoMax / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement("canvas");
        c.width = Math.max(1, Math.round(img.naturalWidth * k));
        c.height = Math.max(1, Math.round(img.naturalHeight * k));
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL("image/jpeg", qualidade));
      };
      img.onerror = () => res(null);
      img.src = src;
    });
  }
  function lerArquivo(f) {
    return new Promise(res => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = () => res(null); r.readAsDataURL(f); });
  }
  async function fotoAtual() {
    if (!ehImagem(ultimoArquivo)) return "";
    const url = URL.createObjectURL(ultimoArquivo);
    const r = await reduzir(url, 900, .82);
    URL.revokeObjectURL(url);
    return r || "";
  }

  /* Fotos de celular passam do limite de 4,5 MB do servidor: se a foto que o
     front montou for grande, refazemos ela menor antes de enviar. */
  async function reduzirSeGrande(pedido) {
    const LIMITE = 2500000;
    const partes = pedido.body && pedido.body.contents && pedido.body.contents[0] && pedido.body.contents[0].parts || [];
    for (const p of partes) {
      const d = p.inline_data || p.inlineData;
      if (d && d.data && d.data.length > LIMITE) {
        const menor = await reduzir(`data:${d.mime_type || d.mimeType || "image/jpeg"};base64,${d.data}`, 1600, .85);
        if (menor) { d.data = menor.split(",")[1]; if (d.mime_type) d.mime_type = "image/jpeg"; else d.mimeType = "image/jpeg"; }
      }
    }
    if (typeof pedido.imagem === "string" && pedido.imagem.length > LIMITE) {
      const menor = await reduzir(`data:${pedido.mime || "image/jpeg"};base64,${pedido.imagem}`, 1600, .85);
      if (menor) { pedido.imagem = menor.split(",")[1]; pedido.mime = "image/jpeg"; }
    }
  }

  /* "Tentar outra foto": zera os seletores de arquivo (senão escolher a MESMA
     foto de novo não faz nada) e chama o "nova foto" do front, se houver. */
  function novaFoto() {
    document.querySelectorAll('input[type="file"]').forEach(i => { try { i.value = ""; } catch (e) {} });
    temFoto = false; etapaAtual();
    if (CFG.novaFoto) CFG.novaFoto();
  }

  /* ---------- 5) Álbum comum (para grupos sem álbum, ou cujo álbum só
     aceitava as espécies do catálogo). Uso:
       album: { el: "#meuAlbum", depois: () => abrirAbaDoAlbum(), compacto: true }   (compacto: figurinhas pequenas)
     Guarda nome, foto, data e a ficha inteira (tocar na figurinha reabre a ficha). ---------- */
  const chaveAlbum = () => "pokedex-album-" + GRUPO;
  const lerAlbum = () => { try { const l = JSON.parse(localStorage.getItem(chaveAlbum()) || "[]"); return Array.isArray(l) ? l : []; } catch (e) { return []; } };
  const escA = t => String(t == null ? "" : t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  async function salvarNoAlbumComum(info) {
    const lista = lerAlbum(), nome = String(info.nome_popular || info.nome || "Descoberta");
    const foto = ultimoArquivo ? await (async () => { const u = URL.createObjectURL(ultimoArquivo); const r = await reduzir(u, 360, .74); URL.revokeObjectURL(u); return r || ""; })() : "";
    const item = { nome, cientifico: info.nome_cientifico || "", foto, data: new Date().toLocaleDateString("pt-BR"), info };
    const i = lista.findIndex(x => x.nome.toLowerCase() === nome.toLowerCase());
    if (i >= 0) lista.splice(i, 1);
    lista.unshift(item);
    let n = 60;
    while (n > 0) { try { localStorage.setItem(chaveAlbum(), JSON.stringify(lista.slice(0, n))); break; } catch (e) { n -= 10; } }
    desenharAlbumComum();
    FichaPokedex.fechar();
    if (CFG.album.depois) CFG.album.depois();
  }
  function desenharAlbumComum() {
    const caixa = CFG.album && document.querySelector(CFG.album.el);
    if (!caixa) return;
    const lista = lerAlbum(), escuro = CFG.escuro ? CFG.escuro() : true, t = (escuro ? CFG.noturno : CFG.claro) || {};
    caixa.innerHTML = `<style>.fp-album{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;font-family:inherit}
      .fp-album-item{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;border-radius:18px;overflow:hidden;background:${t.fundo || (escuro ? "#14202a" : "#fff")};color:${t.texto || (escuro ? "#fff" : "#222")};border:2px solid ${CFG.cor || "#5c9"}66;box-shadow:0 8px 22px #0003;transition:transform .2s}
      .fp-album-item:hover,.fp-album-item:focus-visible{transform:translateY(-3px);border-color:${CFG.cor || "#5c9"}}
      .fp-album-foto{aspect-ratio:4/3;background:linear-gradient(135deg,${CFG.cor || "#5c9"},${CFG.cor2 || "#9c5"});display:grid;place-items:center;font-size:46px;overflow:hidden}
      .fp-album-foto img{width:100%;height:100%;object-fit:cover;display:block}
      .fp-album-txt{padding:10px 12px 12px;display:flex;flex-direction:column;gap:2px}
      .fp-album-txt b{font-size:16px;line-height:1.2}.fp-album-txt i,.fp-album-txt small{font-size:12.5px;color:${t.suave || (escuro ? "#bbb" : "#666")}}
      .fp-album.compacto{grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:9px}.fp-album.compacto .fp-album-foto{aspect-ratio:1;font-size:34px}
      .fp-album.compacto .fp-album-txt{padding:6px 8px 8px}.fp-album.compacto .fp-album-txt b{font-size:13px}.fp-album.compacto .fp-album-txt i{display:none}.fp-album.compacto .fp-album-txt small{font-size:11px}
      .fp-album-vazio{grid-column:1/-1;text-align:center;padding:28px 16px;border:2px dashed ${CFG.cor || "#5c9"}88;border-radius:18px;color:${t.suave || "inherit"}}</style>
      <div class="fp-album${CFG.album.compacto ? " compacto" : ""}">${lista.length ? lista.map((x, i) => `<button type="button" class="fp-album-item" data-i="${i}" title="Ver a ficha">
        <span class="fp-album-foto">${x.foto ? `<img src="${escA(x.foto)}" alt="">` : escA(CFG.icone || "🌿")}</span>
        <span class="fp-album-txt"><b>${escA(x.nome)}</b>${x.cientifico ? `<i>${escA(x.cientifico)}</i>` : ""}<small>📅 ${escA(x.data)}</small></span></button>`).join("")
        : `<div class="fp-album-vazio"><span style="font-size:40px">${escA(CFG.icone || "🌿")}</span><br><b>Seu álbum ainda está vazio.</b><br>Reconheça uma foto e toque em “💾 Salvar no álbum”!</div>`}</div>`;
    caixa.querySelectorAll(".fp-album-item").forEach(b => b.onclick = () => {
      const x = lista[+b.dataset.i];
      FichaPokedex.mostrar(x.info, { foto: x.foto, extras: CFG.extras ? (CFG.extras(x.info) || []) : [], alerta: CFG.alerta ? (CFG.alerta(x.info) || "") : "",
        acoes: [{ texto: "🗑️ Tirar do álbum", aoClicar: () => { const l = lerAlbum().filter(y => y.nome !== x.nome); localStorage.setItem(chaveAlbum(), JSON.stringify(l)); desenharAlbumComum(); } }, { texto: "Fechar", principal: true, aoClicar: () => {} }] });
    });
  }

  /* ---------- 6) Botões por etapa: só aparecem os botões que fazem sentido
     agora. Uso (cada lista diz o que APARECE naquela etapa; o que estiver em
     alguma lista e não estiver na etapa atual fica escondido):
       etapas: { inicio: ["#camera", "#galeria"], camera: ["#tirar"],
                 foto: ["#identificar", "#trocar"],
                 fotoTirada: ["#tirar"],   // botões que tiram foto da webcam
                 trocar: ["#trocar"] }     // botões que voltam ao começo ---------- */
  let temFoto = false;
  function etapaAtual() {
    if (!CFG.etapas) return;
    const camera = [...document.querySelectorAll("video")].some(v => v.srcObject && v.srcObject.active && v.offsetParent !== null);
    document.documentElement.dataset.fpEtapa = temFoto ? "foto" : camera ? "camera" : "inicio";
  }
  function ligarEtapas() {
    const e = CFG.etapas;
    if (!e) return;
    const todos = [...new Set([...(e.inicio || []), ...(e.camera || []), ...(e.foto || [])])];
    const st = document.createElement("style");
    st.textContent = ["inicio", "camera", "foto"].map(et => {
      const esc = todos.filter(x => !(e[et] || []).includes(x));
      return esc.length ? esc.map(x => `html[data-fp-etapa="${et}"] ${x}`).join(",") + "{display:none!important}" : "";
    }).join("\n");
    document.head.appendChild(st);
    document.addEventListener("change", ev => { const t = ev.target; if (t && t.type === "file" && t.files && t.files[0] && ehImagem(t.files[0])) { temFoto = true; etapaAtual(); } }, true);
    document.addEventListener("click", ev => {
      const t = ev.target.closest && ev.target.closest("button,label,a");
      if (!t) return;
      if ((e.fotoTirada || []).some(x => t.matches(x))) setTimeout(() => { temFoto = true; etapaAtual(); }, 60);
      if ((e.trocar || []).some(x => t.matches(x))) { temFoto = false; setTimeout(etapaAtual, 60); }
    }, true);
    setInterval(etapaAtual, 400);
    etapaAtual();
  }

  function acoesFinais(info) {
    const lista = [];
    if (CFG.salvar) lista.push({ texto: "💾 Salvar no álbum", principal: true, aoClicar: () => CFG.salvar(info) });
    else if (CFG.album) lista.push({ texto: "💾 Salvar no álbum", principal: true, aoClicar: () => salvarNoAlbumComum(info) });
    if (CFG.acoesExtras) lista.push(...(CFG.acoesExtras(info) || []));
    lista.push({ texto: "🔍 Reconhecer outra", principal: !CFG.salvar && !CFG.album, aoClicar: novaFoto });
    return lista;
  }
  const tentarOutra = () => [{ texto: "Tentar outra foto", principal: true, aoClicar: novaFoto }];

  /* ---------- 1) a conversa com a IA vira pop-up ---------- */
  const fetchOriginal = window.fetch.bind(window);
  window.fetch = async function (url, opt) {
    if (!ehIdentificar(url) || !opt || String(opt.method || "GET").toUpperCase() !== "POST" || typeof opt.body !== "string") {
      return fetchOriginal(url, opt);
    }
    let pedido;
    try { pedido = JSON.parse(opt.body); } catch (e) { return fetchOriginal(url, opt); }
    pedido.grupo = pedido.grupo || GRUPO;
    // Modelos antigos (gemini-1.x e 2.x) já foram aposentados pelo Google:
    // sem o nome, o back-end usa o modelo atual.
    if (/^gemini-(1|2)\./.test(pedido.modelo || "")) delete pedido.modelo;
    if (ultimoArquivo) { pedido.tipo = ultimoArquivo.type || "application/octet-stream"; pedido.tamanho = ultimoArquivo.size; }
    if (CFG.instrucaoExtra) {
      const t = pedido.body && pedido.body.contents && pedido.body.contents[0] && (pedido.body.contents[0].parts || []).find(p => typeof p.text === "string");
      if (t) t.text += "\n" + CFG.instrucaoExtra;
    }
    FichaPokedex.carregando(CFG.carregando);
    await reduzirSeGrande(pedido);

    let resp;
    try { resp = await fetchOriginal(url, Object.assign({}, opt, { body: JSON.stringify(pedido) })); }
    catch (e) {
      FichaPokedex.aviso({ tipo: "erro", texto: "💜 Ops! Não consegui falar com o servidor. Confira a internet e tente de novo.", acoes: [{ texto: "Fechar", principal: true }] });
      throw e;
    }
    let dados = null;
    try { dados = await resp.clone().json(); } catch (e) {}

    if (!resp.ok) {
      const msg = dados && dados.error && dados.error.message || "";
      if (resp.status === 422) FichaPokedex.aviso({ tipo: "porteiro", texto: msg, acoes: tentarOutra() });
      else FichaPokedex.aviso({ tipo: "erro", texto: "💜 Ops! Não consegui conversar com o reconhecimento agora. Tente novamente!", detalhe: msg, acoes: [{ texto: "Fechar", principal: true }] });
      return resp;
    }

    const parte = dados && dados.candidates && dados.candidates[0] && dados.candidates[0].content && dados.candidates[0].content.parts && dados.candidates[0].content.parts[0];
    let info = null;
    try { info = JSON.parse(parte.text); } catch (e) {}
    if (!info) {
      FichaPokedex.aviso({ tipo: "erro", texto: "A IA não devolveu uma resposta. Tente outra foto.", acoes: tentarOutra() });
      return resp;
    }
    // Front de texto livre: ele recebe o texto (texto_front), não o JSON.
    const devolver = texto => { parte.text = texto; return new Response(JSON.stringify(dados), { status: 200, headers: { "Content-Type": "application/json" } }); };
    const textoFront = typeof info.texto_front === "string" ? info.texto_front : null;
    if (info.fora_do_tema) {
      FichaPokedex.aviso({ tipo: "fora", texto: info.mensagem_backend, acoes: tentarOutra() });
    } else if (!info.identificado) {
      FichaPokedex.aviso({ tipo: "duvida", texto: info.mensagem_backend || "Não consegui ter certeza. Tente uma foto mais nítida.", acoes: tentarOutra() });
    } else {
      FichaPokedex.mostrar(info, {
        foto: await fotoAtual(),
        extras: CFG.extras ? (CFG.extras(info) || []) : [],
        alerta: CFG.alerta ? (CFG.alerta(info) || "") : "",
        acoes: acoesFinais(info)
      });
      // O front do grupo tem a SUA nota de corte (ex.: 80%). Quem decide agora
      // é a Missão 3 no back-end; então, quando o back-end aceitou, o front
      // também aceita (senão o álbum e os pontos do front não funcionariam).
      const paraFront = Object.assign({}, info, { confianca: Math.max(Number(info.confianca) || 0, CFG.limiarFront) });
      return devolver(textoFront !== null ? textoFront : JSON.stringify(paraFront));
    }
    return textoFront !== null ? devolver(textoFront) : resp;
  };

  /* ---------- 2) arquivo que não é foto: o porteiro decide ---------- */
  async function porteiro(arquivo) {
    FichaPokedex.carregando("🚪 O porteiro está conferindo o arquivo…");
    try {
      const r = await fetchOriginal("/api/identificar", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grupo: GRUPO, tipo: arquivo.type || "application/octet-stream", mime: arquivo.type || "application/octet-stream", tamanho: arquivo.size, imagem: "" })
      });
      const d = await r.json().catch(() => ({}));
      const msg = d && d.error && d.error.message || "Esse arquivo não pode entrar.";
      FichaPokedex.aviso({ tipo: r.status === 422 ? "porteiro" : "erro", texto: msg, acoes: tentarOutra() });
    } catch (e) {
      FichaPokedex.aviso({ tipo: "erro", texto: "Não consegui falar com o servidor.", acoes: tentarOutra() });
    }
  }
  function aoEscolher(arquivo, evento, input) {
    if (!arquivo) return;
    ultimoArquivo = arquivo;
    if (!ehImagem(arquivo)) {
      if (evento) { evento.stopImmediatePropagation(); evento.preventDefault(); }
      if (input) input.value = "";
      porteiro(arquivo);
    }
  }
  document.addEventListener("change", e => {
    const t = e.target;
    if (t instanceof HTMLInputElement && t.type === "file" && t.files && t.files[0]) aoEscolher(t.files[0], e, t);
  }, true);
  document.addEventListener("drop", e => {
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) aoEscolher(f, ehImagem(f) ? null : e, null);
  }, true);

  /* ---------- 3) webcam no computador ---------- */
  function ligarWebcams() {
    document.querySelectorAll('input[type="file"][capture]').forEach(input => {
      if (input.dataset.fpCamera) return;
      input.dataset.fpCamera = "1";
      FichaPokedex.ligarCamera(input, arquivo => {
        const dt = new DataTransfer();
        dt.items.add(arquivo);
        input.files = dt.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });
  }

  function iniciar(o) {
    Object.assign(CFG, o || {});
    FichaPokedex.configurar({
      icone: CFG.icone, cor: CFG.cor, cor2: CFG.cor2, fauna: !!CFG.fauna,
      escuro: CFG.escuro, claro: CFG.claro || {}, noturno: CFG.noturno || {}
    });
    if (CFG.esconder.length) {
      const s = document.createElement("style");
      s.textContent = CFG.esconder.map(x => "html.fp-esconder " + x).join(",") + "{display:none!important}";
      document.head.appendChild(s);
      document.documentElement.classList.add("fp-esconder");
    }
    const pronto = () => { ligarWebcams(); botaoGaleria(); FichaPokedex.trocarFotos(); desenharAlbumComum(); ligarEtapas(); };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", pronto); else pronto();
  }

  /* 4) Botão "🖼️ Galeria": quando o único botão de foto do grupo usa um campo
     com capture, no tablet ele só abre a câmera. Este botão (com a mesma cara
     do botão do grupo) abre a galeria e entrega a foto ao mesmo campo.
     Uso: galeria: { depoisDe: "label.file-label", input: "#photoInput" } */
  function botaoGaleria() {
    const g = CFG.galeria;
    if (!g) return;
    const ref = document.querySelector(g.depoisDe), input = document.querySelector(g.input);
    if (!ref || !input || document.querySelector(".fp-galeria")) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = (g.classe != null ? g.classe : ref.className) + " fp-galeria";
    b.textContent = g.texto || "🖼️ Galeria";
    b.addEventListener("click", e => {
      e.preventDefault();
      FichaPokedex.escolherArquivo(arquivo => {
        const dt = new DataTransfer();
        dt.items.add(arquivo);
        input.files = dt.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });
    ref.insertAdjacentElement("afterend", b);
    // sem flex/grid no pai, os botões ficariam grudados
    if (!/flex|grid/.test(getComputedStyle(ref.parentElement).display)) b.style.marginLeft = "8px";
  }

  /* Mostra de novo o resultado antigo do front (ex.: para usar um minigame
     que o grupo colocou lá dentro) e rola a tela até o elemento pedido. */
  function mostrarFront(seletor) {
    document.documentElement.classList.remove("fp-esconder");
    const el = seletor && document.querySelector(seletor);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
  }
  /* Ao começar uma nova identificação, o resultado antigo volta a ficar escondido. */
  document.addEventListener("change", e => { if (e.target && e.target.type === "file") document.documentElement.classList.toggle("fp-esconder", CFG.esconder.length > 0); }, true);

  window.PokedexAdaptador = { iniciar, mostrarFront, grupo: GRUPO, lerAlbum, desenharAlbum: desenharAlbumComum };
})();
