/* ============================================================================
   FICHA PADRÃO DA POKÉDEX  —  a tela de resultado igual para todos os grupos
   ============================================================================
   Cada grupo tem o seu front (cores, telas, ideias), mas a FICHA de resultado
   segue o mesmo padrão do index.html do projeto original:
     - nome popular, nome científico, % de certeza e a mensagem do grupo;
     - aba "Sobre": conservação, curiosidades, espécies parecidas e os campos
       extras que o grupo quiser (ex.: luz, água, cuidados);
     - aba "Localização": mapa real do Brasil com os biomas e as regiões;
     - aba "Habitat": a cena do bioma, com a foto da espécie e o ícone do tema.

   Tudo aparece num POP-UP no meio da tela (com X para fechar no topo), para
   não precisar rolar a página no tablet: o "procurando…", a ficha, a dúvida,
   o "não é do tema" e os erros.

   COMO USAR NO FRONT DO GRUPO:
     <script src="/comum/ficha.js"></script>
     FichaPokedex.configurar({
       icone: "🌸", cor: "#ff63ad", cor2: "#a76cff", fauna: false,
       escuro: () => document.body.dataset.theme !== "light",  // modo do front
       claro:  { fundo: "#fcf8ff", texto: "#35105e", suave: "#654b78" },
       noturno:{ fundo: "#1b0d2e", texto: "#fffaff", suave: "#dbcde8" }
     });
     FichaPokedex.carregando("Procurando pistas…");
     FichaPokedex.mostrar(respostaDaIA, { foto, extras, acoes });   // a ficha
     FichaPokedex.aviso({ tipo: "duvida", titulo, texto });          // avisos
     FichaPokedex.ligarCamera(inputDaCamera, arquivo => ...);        // webcam no PC
     FichaPokedex.trocarFotos();   // <img data-especie="Hibiscus rosa-sinensis">
   O CSS, as fontes e o mapa (Leaflet) são carregados sozinhos por aqui.
   ========================================================================== */
(function () {
  "use strict";

  /* Biomas: cor, centro no mapa e raio aproximado (em metros). */
  const BIOMAS = {
    "Amazônia":       { cor: "#3ef0a0", coord: [-3.4, -62.2], raio: 820000 },
    "Cerrado":        { cor: "#d6c75a", coord: [-15.6, -49.0], raio: 640000 },
    "Mata Atlântica": { cor: "#5fcf6e", coord: [-22.8, -44.6], raio: 520000 },
    "Caatinga":       { cor: "#e09a4a", coord: [-9.2, -40.3], raio: 540000 },
    "Pantanal":       { cor: "#4cc4d6", coord: [-17.7, -57.3], raio: 300000 },
    "Pampa":          { cor: "#9ad65a", coord: [-30.6, -54.2], raio: 300000 }
  };
  /* Foto real de cada cenário (banco Unsplash). */
  const CENARIOS = {
    floresta_amazonica: { nome: "Floresta Amazônica",   foto: "photo-1591081658714-f576fb7ea3ed" },
    mata_atlantica:     { nome: "Mata Atlântica",       foto: "photo-1448375240586-882707db888b" },
    cerrado:            { nome: "Cerrado",              foto: "photo-1535940360221-641a69c43bac" },
    caatinga:           { nome: "Caatinga",             foto: "photo-1592521899562-172a1fda8059" },
    pampa:              { nome: "Pampa",                foto: "photo-1758614685215-b1d7dbaca5c6" },
    pantanal:           { nome: "Pantanal",             foto: "photo-1566818421132-700d4b3ceeb7" },
    rio:                { nome: "Rios e igarapés",      foto: "photo-1591081658714-f576fb7ea3ed" },
    manguezal:          { nome: "Manguezal",            foto: "photo-1717292741426-d050f4f25503" },
    urbano:             { nome: "Áreas urbanas",        foto: "photo-1620337634371-2a57564f24b5" },
    plantacao:          { nome: "Plantações e pomares", foto: "photo-1591389703635-e15a07b842d7" }
  };
  const BIOMA_CENARIO = {
    "Amazônia": "floresta_amazonica", "Cerrado": "cerrado", "Mata Atlântica": "mata_atlantica",
    "Caatinga": "caatinga", "Pampa": "pampa", "Pantanal": "pantanal"
  };
  const PERIODOS = { dia: "Dia", amanhecer: "Amanhecer", crepusculo: "Crepúsculo", noite: "Noite" };

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const lista = v => Array.isArray(v) ? v.filter(Boolean) : (v ? [v] : []);
  const fotoCenario = id => `https://images.unsplash.com/${(CENARIOS[id] || CENARIOS.floresta_amazonica).foto}?auto=format&fit=crop&w=1100&q=78`;

  /* ---------- carregar CSS, fontes e Leaflet uma vez só ---------- */
  function carregarRecursos() {
    if (document.getElementById("fp-css")) return;
    const head = document.head;
    const fontes = document.createElement("link");
    fontes.rel = "stylesheet";
    fontes.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,900&family=Hanken+Grotesk:wght@400;600;700&family=Space+Mono:wght@400;700&display=swap";
    head.appendChild(fontes);
    const leafletCss = document.createElement("link");
    leafletCss.rel = "stylesheet";
    leafletCss.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    head.appendChild(leafletCss);
    const css = document.createElement("style");
    css.id = "fp-css";
    css.textContent = CSS;
    head.appendChild(css);
  }
  let leafletPromessa = null;
  function carregarLeaflet() {
    if (window.L) return Promise.resolve();
    if (!leafletPromessa) {
      leafletPromessa = new Promise((ok, falha) => {
        const s = document.createElement("script");
        s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        s.onload = ok; s.onerror = falha;
        document.head.appendChild(s);
      });
    }
    return leafletPromessa;
  }

  /* ---------- aba Localização ---------- */
  function htmlLocalizacao(d) {
    const biomas = lista(d.biomas).filter(b => BIOMAS[b]);
    const regioes = lista(d.regioes);
    const legenda = Object.entries(BIOMAS).map(([nome, b]) =>
      `<div class="fp-legend-item ${biomas.includes(nome) ? "on" : ""}" style="--lc:${b.cor}"><span class="fp-swatch" style="background:${b.cor}"></span>${esc(nome)}</div>`).join("");
    return `<div class="fp-col-img"><div class="fp-map"></div></div><div class="fp-col-info">
      ${biomas.length ? `<p class="fp-map-note">Os focos acesos mostram onde <strong>${esc(d.nome_popular)}</strong> ocorre no Brasil. O ponto pulsante é o bioma principal. Arraste e dê zoom no mapa.</p>` : `<p class="fp-map-note">A IA não indicou biomas brasileiros para esta espécie.</p>`}
      <div class="fp-legend"><div class="fp-label">Biomas onde ocorre</div><div class="fp-legend-grid">${legenda}</div></div>
      ${regioes.length ? `<div class="fp-section"><div class="fp-label">Onde costuma ocorrer</div><div class="fp-chips">${regioes.map(r => `<span class="fp-region">${esc(r)}</span>`).join("")}</div></div>` : ""}</div>`;
  }
  function desenharMapa(caixa, d) {
    const el = caixa.querySelector(".fp-map");
    if (!el || el.dataset.pronto) return;
    el.dataset.pronto = "1";
    carregarLeaflet().then(() => {
      const L = window.L;
      // Fundo do mapa: OpenStreetMap (gratuito, sem chave). No modo escuro o
      // CSS "inverte" as cores do mapa para combinar com a ficha.
      const map = L.map(el, { scrollWheelZoom: false, zoomSnap: 0.25 });
      map.attributionControl.setPrefix(false);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 11, attribution: "© OpenStreetMap" }).addTo(map);
      const pts = [];
      lista(d.biomas).filter(b => BIOMAS[b]).forEach((nome, i) => {
        const b = BIOMAS[nome];
        L.circle(b.coord, { radius: b.raio, color: b.cor, weight: 1, opacity: .55, fillColor: b.cor, fillOpacity: .16 }).addTo(map);
        const icon = L.divIcon({ className: "", iconSize: [24, 24], iconAnchor: [12, 12], html: `<span class="fp-marker ${i === 0 ? "primary" : ""}" style="--mc:${b.cor}"></span>` });
        L.marker(b.coord, { icon }).addTo(map).bindTooltip(`<b>${esc(nome)}</b>${i === 0 ? " · principal" : ""}`, { direction: "top", offset: [0, -10] });
        pts.push(b.coord);
      });
      if (pts.length) { map.fitBounds(L.latLngBounds(pts).pad(.55)); if (pts.length === 1) map.setZoom(5); }
      else map.setView([-14.5, -52], 3.6);
      setTimeout(() => map.invalidateSize(), 80);
    }).catch(() => { el.innerHTML = '<div class="fp-map-fallback">Não consegui carregar o mapa (verifique a internet).</div>'; });
  }

  /* mapaBiomas(el, nomes, { aoClicar, escuro }): mapa de verdade do Brasil
     com os biomas pedidos, para usar FORA da ficha (ex.: a aba "Mapa" de um
     grupo). Tocar num bioma chama aoClicar(nome). */
  function mapaBiomas(el, nomes, o) {
    o = o || {};
    if (!el) return Promise.resolve(null);
    carregarRecursos();
    el.classList.add("fp-mapa-solto");
    if (o.escuro) el.classList.add("fp-mapa-escuro");
    return carregarLeaflet().then(() => {
      const L = window.L;
      const map = L.map(el, { scrollWheelZoom: false, zoomSnap: 0.25 });
      map.attributionControl.setPrefix(false);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 11, attribution: "© OpenStreetMap" }).addTo(map);
      const pts = [];
      (nomes || Object.keys(BIOMAS)).filter(n => BIOMAS[n]).forEach(nome => {
        const b = BIOMAS[nome];
        pts.push(b.coord);
        const c = L.circle(b.coord, { radius: b.raio, color: b.cor, weight: 2, opacity: .8, fillColor: b.cor, fillOpacity: .28 }).addTo(map);
        const icon = L.divIcon({ className: "", iconSize: [140, 30], iconAnchor: [70, 15], html: `<div style="width:140px;text-align:center"><span class="fp-mapa-rotulo" style="--mc:${b.cor}">${esc(nome)}</span></div>` });
        const m = L.marker(b.coord, { icon }).addTo(map);
        if (o.aoClicar) [c, m].forEach(x => x.on("click", () => o.aoClicar(nome)));
      });
      const enquadrar = () => { map.invalidateSize(); if (pts.length) map.fitBounds(L.latLngBounds(pts).pad(.22)); };
      map.setView([-14.5, -52], 4);
      enquadrar();
      if (window.ResizeObserver) new ResizeObserver(enquadrar).observe(el);
      return map;
    }).catch(() => { el.innerHTML = '<div class="fp-map-fallback">Não consegui carregar o mapa (verifique a internet).</div>'; return null; });
  }

  /* ---------- aba Habitat: a cena do bioma com a espécie ---------- */
  function motes(seed) {
    let out = "";
    for (let i = 0; i < 14; i++) {
      const x = (seed * 37 + i * 61) % 100, y = 18 + ((seed * 17 + i * 53) % 74);
      const sz = (1.6 + ((i * 7) % 4) * 0.7).toFixed(1), dur = 7 + ((i * 13) % 9);
      out += `<span class="fp-mote" style="left:${x}%;top:${y}%;width:${sz}px;height:${sz}px;animation-duration:${dur}s;animation-delay:${-(i * 1.3).toFixed(1)}s;--fx:${8 + ((i * 11) % 18)}px;--fy:${-(10 + ((i * 9) % 20))}px"></span>`;
    }
    return out;
  }
  function htmlCena(bioma, periodo, itens) {
    const cenario = BIOMA_CENARIO[bioma] || "floresta_amazonica";
    const doBioma = itens.filter(it => lista(it.biomas).includes(bioma));
    const fauna = doBioma.filter(it => it.fauna), flora = doBioma.filter(it => !it.fauna);
    const roam = fauna.map((it, i) => `
      <button class="fp-roam${i % 2 ? " flip" : ""}${it.atual ? " current" : ""}" style="--lane:${42 + ((i * 17) % 14)}%;--spd:${22 + (i % 5) * 4}s;--delay:${-(i * 3.4).toFixed(1)}s;--c:${it.cor}" title="${esc(it.nome)}">
        <span class="fp-walk"><span class="fp-thumb"><img src="${it.img}" alt=""><span class="fp-emoji">${it.icone}</span></span></span>
        <span class="fp-tag">${esc(it.nome)}</span></button>`).join("");
    const garden = flora.map((it, i) => `
      <button class="fp-plant${it.atual ? " current" : ""}" style="--gx:${flora.length === 1 ? 50 : 12 + i * (76 / (flora.length - 1))}%;--lane:${38 + ((i * 9) % 8)}%;--c:${it.cor};--gdelay:${(i % 5) * .3}s" title="${esc(it.nome)}">
        <span class="fp-pthumb"><img src="${it.img}" alt=""><span class="fp-emoji">${it.icone}</span></span>
        <span class="fp-tag">${esc(it.nome)}</span></button>`).join("");
    const vazio = doBioma.length ? "" : `<div class="fp-empty"><p>Esta espécie não aparece no(a) <strong>${esc(bioma)}</strong>. Escolha outro bioma acima.</p></div>`;
    const botoes = Object.entries(PERIODOS).map(([k, n]) => `<button data-per="${k}" class="${k === periodo ? "on" : ""}">${n}</button>`).join("");
    const seed = (bioma.charCodeAt(0) || 65) + bioma.length;
    return `<div class="fp-scene per-${periodo}">
      <div class="fp-photo" style="background-image:url('${fotoCenario(cenario)}')"></div>
      <div class="fp-grade"></div><div class="fp-rays"></div><div class="fp-stars"></div>
      <div class="fp-particles">${motes(seed)}</div><div class="fp-vignette"></div>
      ${roam}${garden}${vazio}
      <div class="fp-controls">${botoes}</div>
      <div class="fp-overlay"><div class="fp-bioma" data-base="${esc(CENARIOS[cenario].nome)}">${esc(CENARIOS[cenario].nome)} · ${PERIODOS[periodo]}</div>
        <div class="fp-scene-title">${fauna.length ? "Toque no bichinho para ver o nome" : "Toque na plantinha para ver o nome"}</div></div>
    </div>`;
  }
  function desenharCena(caixa, estado) {
    const box = caixa.querySelector(".fp-safari");
    box.innerHTML = `<div class="fp-biomes">${Object.entries(BIOMAS).map(([nome, b]) =>
      `<button class="fp-biome ${nome === estado.bioma ? "active" : ""}" data-bioma="${esc(nome)}" style="--bc:${b.cor}"><span class="fp-dot"></span>${esc(nome)}</button>`).join("")}</div>` +
      htmlCena(estado.bioma, estado.periodo, estado.itens);
    box.querySelectorAll(".fp-biome").forEach(b => b.onclick = () => { estado.bioma = b.dataset.bioma; desenharCena(caixa, estado); });
    box.querySelectorAll(".fp-roam,.fp-plant").forEach(b => b.onclick = () => b.classList.toggle("show"));
    const cena = box.querySelector(".fp-scene");
    cena.querySelectorAll(".fp-controls button").forEach(b => b.onclick = () => {
      estado.periodo = b.dataset.per;
      cena.querySelectorAll(".fp-controls button").forEach(x => x.classList.toggle("on", x === b));
      cena.className = "fp-scene per-" + estado.periodo;
      const lbl = cena.querySelector(".fp-bioma");
      lbl.textContent = lbl.dataset.base + " · " + PERIODOS[estado.periodo];
    });
  }
  function htmlHabitat(d) {
    const comp = lista(d.companheiros_habitat).slice(0, 5);
    const elementos = lista(d.elementos_cenario);
    return `<div class="fp-col-img">
      <div class="fp-label">Habitat · toque na espécie e troque o período</div>
      <div class="fp-safari"></div></div><div class="fp-col-info">
      ${d.habitat_descricao ? `<div class="fp-habitat-desc">${esc(d.habitat_descricao)}</div>` : ""}
      ${d.curiosidade_habitat ? `<div class="fp-section"><div class="fp-label">Vida no habitat</div><ul class="fp-facts"><li>${esc(d.curiosidade_habitat)}</li></ul></div>` : ""}
      ${comp.length ? `<div class="fp-section"><div class="fp-label">Divide o habitat com</div><div class="fp-chips">${comp.map(c => `<span class="fp-comp">${esc(c)}</span>`).join("")}</div></div>` : ""}
      ${elementos.length ? `<div class="fp-section"><div class="fp-label">No cenário você encontra</div><div class="fp-chips">${elementos.map(e => `<span class="fp-chip">${esc(e)}</span>`).join("")}</div></div>` : ""}</div>`;
  }

  /* ---------- configuração do grupo (cores, ícone, modo claro/escuro) ---------- */
  const CFG = { icone: "", cor: "#3ef0a0", cor2: "", fauna: false, escuro: null, claro: {}, noturno: {} };
  function configurar(o) { Object.assign(CFG, o || {}); }
  function modoEscuro() {
    if (typeof CFG.escuro === "function") return !!CFG.escuro();
    if (typeof CFG.escuro === "boolean") return CFG.escuro;
    const t = (document.body.dataset.theme || document.documentElement.dataset.theme || "").toLowerCase();
    if (t) return t !== "light" && t !== "claro";
    if (document.body.classList.contains("light") || document.documentElement.classList.contains("light")) return false;
    if (document.body.classList.contains("dark") || document.documentElement.classList.contains("dark")) return true;
    return !(window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches);
  }
  /* Pinta um elemento .fp com as cores do grupo no modo atual. */
  function pintar(el) {
    const escuro = modoEscuro();
    const base = escuro
      ? { fundo: "#0e1512", cartao: "", texto: "#f1f6f3", suave: "#a9b9b1", linha: "" }
      : { fundo: "#ffffff", cartao: "", texto: "#1d2621", suave: "#5d6b64", linha: "" };
    const p = Object.assign(base, escuro ? CFG.noturno : CFG.claro);
    const cor = p.cor || CFG.cor, cor2 = p.cor2 || CFG.cor2 || cor;
    const v = {
      "--glow-primary": cor, "--glow-secondary": cor2, "--glow-warm": cor2,
      "--fp-fundo": p.fundo, "--fp-texto": p.texto, "--fp-suave": p.suave,
      "--fp-cartao": p.cartao || `color-mix(in srgb, ${p.texto} ${escuro ? 6 : 4}%, transparent)`,
      "--fp-linha": p.linha || `color-mix(in srgb, ${p.texto} ${escuro ? 14 : 12}%, transparent)`
    };
    Object.entries(v).forEach(([k, x]) => el.style.setProperty(k, x));
    el.classList.toggle("fp-escuro", escuro);
    el.classList.toggle("fp-claro", !escuro);
  }

  /* ---------- a ficha completa ---------- */
  function renderFicha(el, d, o) {
    o = o || {};
    carregarRecursos();
    const cor = CFG.cor, icone = CFG.icone || (CFG.fauna ? "🐾" : "🌿");
    const curiosidades = lista(d.curiosidades);
    const parecidas = lista(d.especies_parecidas);
    const extras = (o.extras || []).filter(x => x && x[1]);
    const biomas = lista(d.biomas).filter(b => BIOMAS[b]);
    const ICO = {
      sobre: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
      local: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
      habitat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21l3-9 6 4 6-7 3 12"/><path d="M3 21h18"/></svg>'
    };
    el.innerHTML = `<div class="fp-ficha">
      <div class="fp-head">
        ${o.foto ? `<img class="fp-foto" src="${o.foto}" alt="">` : ""}
        <div class="fp-names"><div class="fp-name">${esc(d.nome_popular || d.nome)}</div>${d.nome_cientifico ? `<div class="fp-sci">${esc(d.nome_cientifico)}</div>` : ""}</div>
        ${d.confianca != null ? `<div class="fp-badge">${esc(d.confianca)}% certeza</div>` : ""}
      </div>
      ${d.mensagem_backend ? `<div class="fp-msg">${esc(d.mensagem_backend)}</div>` : ""}
      ${o.alerta ? `<div class="fp-alerta">⚠️ ${esc(o.alerta)}</div>` : ""}
      <div class="fp-tabs" role="tablist">
        <button class="fp-tab active" data-tab="sobre">${ICO.sobre}Sobre</button>
        <button class="fp-tab" data-tab="local">${ICO.local}Localização</button>
        <button class="fp-tab" data-tab="habitat">${ICO.habitat}Habitat</button>
      </div>
      <div class="fp-panel on" data-panel="sobre">
        ${d.status_conservacao ? `<div class="fp-section"><div class="fp-label">Conservação</div><div class="fp-cons"><span class="fp-cdot"></span>${esc(d.status_conservacao)}</div></div>` : ""}
        ${curiosidades.length ? `<div class="fp-section"><div class="fp-label">Você sabia?</div><ul class="fp-facts">${curiosidades.map(c => `<li>${esc(c)}</li>`).join("")}</ul></div>` : ""}
        ${extras.map(([t, v]) => `<div class="fp-section"><div class="fp-label">${esc(t)}</div><p class="fp-text">${esc(v)}</p></div>`).join("")}
        ${parecidas.length ? `<div class="fp-section"><div class="fp-label">Parecidas</div><div class="fp-chips">${parecidas.map(c => `<span class="fp-chip">${esc(c)}</span>`).join("")}</div></div>` : ""}
      </div>
      <div class="fp-panel" data-panel="local">${htmlLocalizacao(d)}</div>
      <div class="fp-panel" data-panel="habitat">${htmlHabitat(d)}</div>
    </div>`;

    const estado = {
      bioma: biomas[0] || "Amazônia",
      periodo: PERIODOS[d.cenario_periodo] ? d.cenario_periodo : "dia",
      itens: [{ nome: d.nome_popular || d.nome || "Espécie", img: o.foto || "", icone, cor, fauna: !!CFG.fauna, biomas, atual: true }]
    };
    const tabs = el.querySelectorAll(".fp-tab"), panels = el.querySelectorAll(".fp-panel");
    tabs.forEach(t => t.onclick = () => {
      tabs.forEach(x => x.classList.toggle("active", x === t));
      panels.forEach(p => p.classList.toggle("on", p.dataset.panel === t.dataset.tab));
      if (t.dataset.tab === "local") desenharMapa(el, d);
      if (t.dataset.tab === "habitat" && !el.querySelector(".fp-scene")) desenharCena(el, estado);
    });
  }

  /* ---------- o POP-UP no meio da tela ---------- */
  let popAtual = null, observador = null;
  function fechar() {
    if (!popAtual) return;
    const pop = popAtual; popAtual = null;
    if (pop._aoFechar) pop._aoFechar();
    if (observador) { observador.disconnect(); observador = null; }
    pop.remove();
    document.documentElement.classList.remove("fp-travado");
  }
  /* abrirPopup: cria a janela com o X no topo e devolve o miolo e o rodapé. */
  function abrirPopup(classeExtra) {
    carregarRecursos();
    fechar();
    const pop = document.createElement("div");
    pop.className = "fp-pop";
    pop.setAttribute("role", "dialog");
    pop.setAttribute("aria-modal", "true");
    pop.innerHTML = `<div class="fp fp-box ${classeExtra || ""}">
      <div class="fp-top"><button type="button" class="fp-x" aria-label="Fechar">✕</button></div>
      <div class="fp-corpo"></div><div class="fp-acoes"></div></div>`;
    document.body.appendChild(pop);
    document.documentElement.classList.add("fp-travado");
    const box = pop.querySelector(".fp-box");
    pintar(box);
    // Se o aluno trocar claro/escuro com o pop-up aberto, a ficha acompanha.
    observador = new MutationObserver(() => pintar(box));
    [document.body, document.documentElement].forEach(n => observador.observe(n, { attributes: true, attributeFilter: ["data-theme", "class"] }));
    pop.querySelector(".fp-x").onclick = fechar;
    pop.addEventListener("click", e => { if (e.target === pop) fechar(); });
    popAtual = pop;
    return { pop, corpo: pop.querySelector(".fp-corpo"), acoes: pop.querySelector(".fp-acoes") };
  }
  document.addEventListener("keydown", e => { if (e.key === "Escape") fechar(); });

  /* Botões do rodapé do pop-up: [{ texto, principal, aoClicar }] */
  function botoes(caixa, lista) {
    (lista || []).forEach(b => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "fp-btn" + (b.principal ? " principal" : "");
      el.textContent = b.texto;
      el.onclick = () => { if (b.fechar !== false) fechar(); if (b.aoClicar) b.aoClicar(); };
      caixa.appendChild(el);
    });
    if (!caixa.children.length) caixa.remove();
  }

  /* mostrar(d, o): a ficha no pop-up. o = { foto, extras, alerta, acoes } */
  function mostrar(d, o) {
    if (d instanceof Element) return renderFicha(d, o, arguments[2]);   // jeito antigo
    const { corpo, acoes } = abrirPopup("fp-box-ficha");
    renderFicha(corpo, d, o || {});
    botoes(acoes, (o && o.acoes) || []);
  }

  /* aviso({ tipo, titulo, texto, acoes }): dúvida, fora do tema, erro… */
  const TIPOS = {
    duvida: { icone: "🤔", titulo: "Hmm… fiquei em dúvida" },
    fora:   { icone: "🚫", titulo: "Fora do tema" },
    porteiro: { icone: "🚪", titulo: "O porteiro barrou" },
    erro:   { icone: "⚠️", titulo: "Algo deu errado" },
    info:   { icone: "💡", titulo: "" }
  };
  function aviso(o) {
    o = o || {};
    const t = TIPOS[o.tipo] || TIPOS.info;
    const { corpo, acoes } = abrirPopup("fp-box-aviso fp-tipo-" + (o.tipo || "info"));
    corpo.innerHTML = `<div class="fp-aviso">
      <div class="fp-aviso-ic">${o.icone || t.icone}</div>
      ${(o.titulo ?? t.titulo) ? `<h3>${esc(o.titulo ?? t.titulo)}</h3>` : ""}
      <p>${esc(o.texto || "")}</p>
      ${o.detalhe ? `<p class="fp-detalhe">${esc(o.detalhe)}</p>` : ""}</div>`;
    botoes(acoes, o.acoes || [{ texto: "Tentar outra foto", principal: true }]);
  }
  function carregando(texto) {
    const { corpo, acoes } = abrirPopup("fp-box-aviso");
    corpo.innerHTML = `<div class="fp-aviso"><div class="fp-spinner"></div><p>${esc(texto || "Procurando pistas…")}</p></div>`;
    acoes.remove();
  }

  /* ---------- câmera do computador (webcam) ----------
     No tablet/celular, o <input capture> já abre a câmera de verdade. No
     computador ele só abre a pasta de arquivos; então lá abrimos a webcam
     num pop-up com o botão "Capturar". */
  function temWebcam() {
    const toque = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    return !toque && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && window.isSecureContext;
  }
  /* escolherArquivo(): abre a pasta de arquivos NA HORA do toque (o navegador
     só deixa abrir dentro do próprio clique) com um campo sem "capture", para
     abrir a galeria/pasta, e não a câmera. */
  function escolherArquivo(aoEscolher) {
    const i = document.createElement("input");
    i.type = "file"; i.accept = "image/*"; i.style.display = "none";
    document.body.appendChild(i);
    i.addEventListener("change", () => { const f = i.files && i.files[0]; i.remove(); if (f) aoEscolher(f); });
    i.click();
  }
  function webcam(aoEscolher) {
    const { pop, corpo, acoes } = abrirPopup("fp-box-aviso");
    corpo.innerHTML = `<div class="fp-aviso"><video class="fp-video" autoplay playsinline muted></video><p class="fp-detalhe">Enquadre bem e toque em Capturar.</p></div>`;
    const video = corpo.querySelector("video");
    let fluxo = null;
    pop._aoFechar = () => { if (fluxo) fluxo.getTracks().forEach(t => t.stop()); };
    const arquivo = { texto: "📁 Escolher arquivo", aoClicar: () => escolherArquivo(aoEscolher) };
    botoes(acoes, [arquivo, { texto: "📸 Capturar", principal: true, fechar: false, aoClicar: () => {
      if (!video.videoWidth) return;
      const c = document.createElement("canvas");
      c.width = video.videoWidth; c.height = video.videoHeight;
      c.getContext("2d").drawImage(video, 0, 0);
      c.toBlob(b => { fechar(); aoEscolher(new File([b], "webcam.jpg", { type: "image/jpeg" })); }, "image/jpeg", .9);
    } }]);
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then(s => { fluxo = s; video.srcObject = s; })
      .catch(() => {
        // sem webcam (ou permissão negada): fica só o botão de escolher arquivo
        corpo.innerHTML = `<div class="fp-aviso"><div class="fp-aviso-ic">📷</div><h3>Não consegui abrir a câmera</h3><p class="fp-detalhe">Escolha uma foto do computador.</p></div>`;
        acoes.innerHTML = "";
        botoes(acoes, [Object.assign({}, arquivo, { principal: true })]);
      });
  }
  /* ligarCamera(input, aoEscolher): no computador, o clique no "Tirar foto"
     abre a webcam em vez da pasta de arquivos. No tablet, nada muda. */
  function ligarCamera(input, aoEscolher) {
    if (!input) return;
    input.addEventListener("click", e => {
      if (!temWebcam()) return;
      e.preventDefault();
      webcam(aoEscolher);
    });
  }


  /* ---------- fotos nítidas e certas das espécies ----------
     Busca a foto principal do artigo da Wikipédia da espécie (pelo nome
     científico, que é o mais preciso). Guarda no navegador para não buscar de
     novo. Se não achar, fica a foto que já estava. */
  function fotoDaEspecie(termo, largura) {
    const chave = "fpFoto:" + termo;
    try { const c = JSON.parse(localStorage.getItem(chave) || "null"); if (c) return Promise.resolve(c); } catch (e) {}
    return fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(termo.replace(/ /g, "_")))
      .then(r => r.ok ? r.json() : null)
      .then(j => {
        const pequena = j && j.thumbnail && j.thumbnail.source;
        if (!pequena) return null;
        const r = { pequena, grande: pequena.replace(/\/\d+px-/, "/" + (largura || 960) + "px-"), original: j.originalimage && j.originalimage.source };
        try { localStorage.setItem(chave, JSON.stringify(r)); } catch (e) {}
        return r;
      }).catch(() => null);
  }
  /* Carrega a primeira URL que funcionar (grande → original → pequena). */
  function primeiraQueCarrega(urls) {
    return urls.filter(Boolean).reduce((p, u) => p.then(ok => ok || new Promise(res => {
      const im = new Image(); im.onload = () => res(u); im.onerror = () => res(null); im.src = u;
    })), Promise.resolve(null));
  }
  function urlDaEspecie(termo) {
    return fotoDaEspecie(termo).then(r => r ? primeiraQueCarrega([r.grande, r.original, r.pequena]) : null);
  }
  /* trocarFotos(): toda <img data-especie="..."> ganha a foto nítida; todo
     elemento com data-especie-fundo="..." ganha a foto como fundo. */
  function trocarFotos(raiz) {
    raiz = raiz || document;
    raiz.querySelectorAll("img[data-especie]").forEach(img =>
      urlDaEspecie(img.dataset.especie).then(u => { if (u) img.src = u; }));
    raiz.querySelectorAll("[data-especie-fundo]").forEach(el =>
      urlDaEspecie(el.dataset.especieFundo).then(u => { if (u) el.style.backgroundImage = `url("${u}")`; }));
  }

  /* ---------- o visual (só vale dentro da ficha: classe .fp) ---------- */
  const CSS = `/* Os fronts dos alunos têm estilos para TODOS os botões (sombra, pulo no
   hover, margem…). Isto zera esses estilos dentro da ficha. */
.fp button{box-shadow:none;transform:none;filter:none;text-shadow:none;margin:0;min-width:0;min-height:0;letter-spacing:normal;text-transform:none;outline-offset:2px;line-height:1.2;width:auto;height:auto;opacity:1;-webkit-tap-highlight-color:transparent}
.fp button:active{transform:scale(.97)}

.fp{--surface:var(--fp-cartao,rgba(255,255,255,.05));--surface-line:var(--fp-linha,rgba(255,255,255,.12));--text:var(--fp-texto,#f1f6f3);--text-dim:var(--fp-suave,#a9b9b1);--bg-1:var(--fp-fundo,#0e1512);
  color:var(--text);background:linear-gradient(160deg,color-mix(in srgb,var(--glow-primary) 10%,var(--bg-1)),var(--bg-1) 55%);border:1px solid var(--surface-line);border-radius:22px;padding:20px;
  font-family:'Hanken Grotesk',system-ui,sans-serif;text-align:left;box-shadow:0 26px 60px -30px rgba(0,0,0,.45)}
.fp *{box-sizing:border-box}
.fp-head{display:flex;align-items:center;gap:14px}
.fp-foto{width:64px;height:64px;border-radius:16px;object-fit:cover;border:2px solid var(--glow-primary);flex-shrink:0}
.fp-names{flex:1;min-width:0}
.fp-name{font-family:'Fraunces',Georgia,serif;font-size:26px;font-weight:900;line-height:1.05;letter-spacing:-.01em}
.fp-sci{font-family:'Space Mono',monospace;font-size:14px;font-style:italic;color:var(--glow-secondary);margin-top:3px}
.fp-badge{flex-shrink:0;font-family:'Space Mono',monospace;font-size:11px;font-weight:700;padding:6px 11px;border-radius:999px;border:1px solid var(--surface-line);color:var(--glow-primary);background:color-mix(in srgb,var(--glow-primary) 10%,transparent)}
.fp-msg{margin:14px 0 0;padding:11px 14px;border-radius:14px;font-weight:700;font-size:16.5px;color:var(--text);background:color-mix(in srgb,var(--glow-primary) 14%,transparent);border:1px solid color-mix(in srgb,var(--glow-primary) 35%,transparent)}
.fp .fp-tabs{display:flex;gap:6px;margin-top:16px;padding:5px;background:color-mix(in srgb,var(--text) 5%,transparent);border:1px solid var(--surface-line);border-radius:14px}
.fp .fp-tab{flex:1;border:none;background:transparent;color:var(--text-dim);font:600 14px 'Hanken Grotesk',system-ui,sans-serif;padding:12px 6px;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px}
.fp .fp-tab svg{width:14px;height:14px}
.fp .fp-tab.active{color:var(--text);background:linear-gradient(135deg,color-mix(in srgb,var(--glow-primary) 24%,transparent),color-mix(in srgb,var(--glow-secondary) 24%,transparent));box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--glow-primary) 40%,transparent)}
.fp-panel{display:none;padding-top:18px}.fp-panel.on{display:block;animation:fpFade .35s ease}
.fp-panel>.fp-section:first-child,.fp-panel>.fp-map:first-child{margin-top:0}
@keyframes fpFade{from{opacity:0}to{opacity:1}}
.fp-section{margin-top:16px}
.fp-label{font-family:'Space Mono',monospace;font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:var(--text-dim);margin:0 0 9px;display:flex;align-items:center;gap:8px}
.fp-label::after{content:"";flex:1;height:1px;background:var(--surface-line)}
.fp-cons{display:inline-flex;align-items:center;gap:8px;font-weight:600}
.fp-cdot{width:9px;height:9px;border-radius:50%;background:var(--glow-primary);box-shadow:0 0 10px var(--glow-primary)}
.fp-facts{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}
.fp-facts li{position:relative;padding-left:20px;font-size:16px;line-height:1.5;color:var(--text)}
.fp-facts li::before{content:"";position:absolute;left:0;top:8px;width:7px;height:7px;border-radius:2px;transform:rotate(45deg);background:var(--glow-warm)}
.fp-text{margin:0;font-size:16px;line-height:1.5;color:var(--text)}
.fp-chips{display:flex;flex-wrap:wrap;gap:7px}
.fp-chip,.fp-comp,.fp-region{font-size:14px;padding:6px 11px;border-radius:10px;background:color-mix(in srgb,var(--glow-secondary) 9%,transparent);border:1px solid color-mix(in srgb,var(--glow-secondary) 22%,transparent);color:var(--text)}
.fp-region{border-radius:999px}
.fp-map{margin-top:14px;height:min(46vh,380px);border-radius:18px;overflow:hidden;border:1px solid var(--surface-line);background:var(--bg-1)}
.fp .leaflet-container{background:var(--bg-1);font-family:'Hanken Grotesk',system-ui,sans-serif}
.fp.fp-escuro .leaflet-tile-pane{filter:invert(1) hue-rotate(180deg) brightness(.85) contrast(.9) saturate(.6)}
.fp .leaflet-tooltip{background:var(--bg-1);border:1px solid var(--surface-line);color:var(--text);border-radius:9px;font-size:12px}
.fp .leaflet-control-zoom a{background:var(--bg-1)!important;color:var(--text)!important;border-color:var(--surface-line)!important}
.fp .leaflet-control-attribution{background:color-mix(in srgb,var(--bg-1) 80%,transparent);color:var(--text-dim);font-size:10px}
.fp .leaflet-control-attribution a{color:var(--text-dim)}
.fp-marker{display:block;width:16px;height:16px;border-radius:50%;background:var(--mc);border:2px solid #04140d;box-shadow:0 0 0 4px color-mix(in srgb,var(--mc) 26%,transparent),0 0 16px var(--mc)}
.fp-marker.primary{width:20px;height:20px;animation:fpPulse 2s ease-in-out infinite}
@keyframes fpPulse{50%{box-shadow:0 0 0 10px color-mix(in srgb,var(--mc) 10%,transparent),0 0 28px var(--mc)}}
.fp-map-note{margin:12px 0 14px;font-size:14.5px;line-height:1.5;color:var(--text-dim)}
.fp-map-note strong{color:var(--text)}
.fp-map-fallback{display:grid;place-items:center;height:100%;color:var(--text-dim);font-size:13px;padding:20px;text-align:center}
.fp-legend{margin-top:14px;padding:13px 15px;border-radius:14px;background:var(--surface);border:1px solid var(--surface-line)}
.fp-legend-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px 12px}
.fp-legend-item{display:flex;align-items:center;gap:9px;font-size:14px;opacity:.4}
.fp-legend-item.on{opacity:1;font-weight:700}
.fp-swatch{width:14px;height:14px;border-radius:4px;flex-shrink:0}
.fp-legend-item.on .fp-swatch{box-shadow:0 0 12px var(--lc)}
.fp .fp-biomes{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
.fp .fp-biome{display:inline-flex;align-items:center;gap:6px;font:600 12px 'Hanken Grotesk',system-ui,sans-serif;padding:6px 11px;border-radius:999px;border:1px solid var(--surface-line);background:var(--surface);color:var(--text-dim);cursor:pointer}
.fp .fp-biome.active{color:var(--text);border-color:color-mix(in srgb,var(--bc) 55%,transparent);background:color-mix(in srgb,var(--bc) 16%,transparent)}
.fp-dot{width:8px;height:8px;border-radius:50%;background:var(--bc);box-shadow:0 0 8px var(--bc)}
.fp-scene{position:relative;border-radius:20px;overflow:hidden;border:1px solid var(--surface-line);aspect-ratio:3/2;max-height:50vh;width:100%;background:#04100a}
.fp-photo{position:absolute;inset:-5%;background-size:cover;background-position:center;transition:filter 1.2s;animation:fpKen 28s ease-in-out infinite alternate}
@keyframes fpKen{from{transform:scale(1.05)}to{transform:scale(1.15) translate(-2.5%,-1.8%)}}
.fp-scene.per-dia .fp-photo{filter:saturate(1.08) brightness(1.03)}
.fp-scene.per-amanhecer .fp-photo{filter:saturate(1.12) brightness(.95) sepia(.2) hue-rotate(-12deg)}
.fp-scene.per-crepusculo .fp-photo{filter:saturate(1.2) brightness(.7) hue-rotate(-6deg)}
.fp-scene.per-noite .fp-photo{filter:saturate(.58) brightness(.4) hue-rotate(8deg)}
.fp-grade{position:absolute;inset:0;pointer-events:none;transition:background .9s}
.fp-scene.per-amanhecer .fp-grade{background:linear-gradient(180deg,rgba(255,168,86,.32),transparent 55%)}
.fp-scene.per-crepusculo .fp-grade{background:linear-gradient(180deg,rgba(150,66,120,.38),rgba(255,110,70,.22) 70%)}
.fp-scene.per-noite .fp-grade{background:linear-gradient(180deg,rgba(18,38,108,.5),rgba(6,14,40,.5))}
.fp-rays{position:absolute;inset:-20% -10%;pointer-events:none;opacity:0;transition:opacity .9s;mix-blend-mode:screen;background:linear-gradient(108deg,transparent 28%,rgba(255,244,200,.16) 40%,transparent 49%,transparent 62%,rgba(255,244,200,.1) 70%,transparent 78%)}
.fp-scene.per-dia .fp-rays{opacity:.85}.fp-scene.per-amanhecer .fp-rays{opacity:1}
.fp-stars{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity 1.2s;background-image:radial-gradient(1.4px 1.4px at 18% 18%,#fff,transparent),radial-gradient(1px 1px at 67% 12%,#fff,transparent),radial-gradient(1.6px 1.6px at 41% 10%,#fff,transparent),radial-gradient(1px 1px at 84% 22%,#fff,transparent),radial-gradient(1.2px 1.2px at 55% 16%,#fff,transparent),radial-gradient(1.5px 1.5px at 92% 8%,#fff,transparent)}
.fp-scene.per-noite .fp-stars{opacity:.95}.fp-scene.per-crepusculo .fp-stars{opacity:.45}
.fp-particles{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.fp-mote{position:absolute;border-radius:50%;background:rgba(255,255,255,.6);animation:fpMote linear infinite}
@keyframes fpMote{0%{transform:translate(0,0);opacity:0}12%,88%{opacity:.7}100%{transform:translate(16px,-44px);opacity:0}}
.fp-scene.per-noite .fp-mote{background:#d6ff86;box-shadow:0 0 9px 2px rgba(190,255,120,.85);animation-name:fpFirefly;animation-timing-function:ease-in-out}
@keyframes fpFirefly{0%,100%{opacity:0;transform:translate(0,0)}25%,75%{opacity:1}50%{opacity:.35;transform:translate(var(--fx),var(--fy))}}
.fp-vignette{position:absolute;inset:0;pointer-events:none;background:radial-gradient(135% 105% at 50% 24%,transparent 44%,rgba(0,0,0,.46))}
.fp-overlay{position:absolute;left:0;right:0;bottom:0;z-index:6;padding:18px 14px 13px;background:linear-gradient(180deg,transparent,rgba(4,10,7,.94) 78%)}
.fp-bioma{font-family:'Space Mono',monospace;font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--glow-primary)}
.fp-scene-title{font-family:'Fraunces',Georgia,serif;font-size:16px;font-weight:600;margin-top:3px}
.fp-controls{position:absolute;top:10px;right:10px;z-index:7;display:flex;flex-wrap:wrap;justify-content:flex-end;gap:5px;max-width:70%}
.fp .fp-controls button{padding:6px 10px;border-radius:999px;border:1px solid var(--surface-line);background:rgba(4,10,7,.62);color:#eaf5ee;font:700 11px 'Hanken Grotesk',system-ui,sans-serif;cursor:pointer}
.fp .fp-controls button.on{background:color-mix(in srgb,var(--glow-primary) 45%,rgba(4,10,7,.6));border-color:transparent}
.fp .fp-roam{position:absolute;z-index:6;bottom:var(--lane);left:-12%;border:none;background:none;padding:0;cursor:pointer;animation:fpWalk var(--spd) linear infinite;animation-delay:var(--delay)}
@keyframes fpWalk{from{left:-12%}to{left:112%}}
.fp .fp-roam.flip{animation-direction:reverse}.fp-roam.flip img{transform:scaleX(-1)}
.fp .fp-roam:hover,.fp .fp-roam.show{animation-play-state:paused;z-index:8}
.fp-walk{display:block;animation:fpBob .62s ease-in-out infinite}
@keyframes fpBob{25%{transform:translateY(-3px) rotate(-3deg)}75%{transform:translateY(-3px) rotate(3deg)}}
.fp-thumb,.fp-pthumb{position:relative;display:block;width:48px;height:48px;border-radius:50%;overflow:visible;border:2px solid var(--c);background:#04140d;box-shadow:0 0 0 4px color-mix(in srgb,var(--c) 25%,transparent),0 0 18px var(--c)}
.fp-pthumb{border-radius:50% 50% 50% 8px}
.fp-thumb img,.fp-pthumb img{width:100%;height:100%;object-fit:cover;display:block;border-radius:inherit}
.fp-emoji{position:absolute;right:-6px;bottom:-6px;width:22px;height:22px;border-radius:50%;background:var(--bg-1);display:grid;place-items:center;font-size:13px;border:1px solid var(--c)}
.fp-tag{position:absolute;left:50%;top:-8px;transform:translate(-50%,-100%);background:rgba(4,10,7,.94);border:1px solid var(--surface-line);color:#eaf5ee;padding:5px 9px;border-radius:9px;font:600 11.5px 'Hanken Grotesk',system-ui,sans-serif;white-space:nowrap;opacity:0;pointer-events:none;transition:.2s}
.fp .fp-roam:hover .fp-tag,.fp .fp-roam.show .fp-tag,.fp .fp-plant:hover .fp-tag,.fp .fp-plant.show .fp-tag{opacity:1}
.fp .fp-plant{position:absolute;z-index:6;bottom:var(--lane);left:var(--gx);border:none;background:none;padding:0;cursor:pointer;transform-origin:bottom center;animation:fpSway 3.9s ease-in-out infinite;animation-delay:var(--gdelay)}
@keyframes fpSway{0%,100%{transform:translateX(-50%) rotate(-2.4deg)}50%{transform:translateX(-50%) rotate(2.4deg)}}
.fp .fp-plant:hover,.fp .fp-plant.show{animation-play-state:paused;z-index:8}
.fp .fp-roam.current .fp-thumb,.fp .fp-plant.current .fp-pthumb{animation:fpCurrent 1.8s ease-in-out infinite}
@keyframes fpCurrent{50%{box-shadow:0 0 0 8px color-mix(in srgb,var(--c) 28%,transparent),0 0 26px var(--c)}}
.fp-empty{position:absolute;inset:0;z-index:5;display:grid;place-items:center;padding:30px;text-align:center}
.fp-empty p{max-width:260px;font-size:13.5px;line-height:1.5;background:rgba(4,10,7,.6);padding:12px 14px;border-radius:14px;border:1px solid var(--surface-line)}
.fp-habitat-desc{margin-top:12px;padding:13px;border-radius:14px;background:color-mix(in srgb,var(--glow-primary) 6%,transparent);border:1px solid color-mix(in srgb,var(--glow-primary) 18%,transparent);font-size:15.5px;line-height:1.55;color:var(--text)}
.fp-alerta{margin-top:12px;padding:11px 14px;border-radius:14px;font-weight:600;font-size:14px;background:color-mix(in srgb,#ff5a5a 12%,transparent);border:1px solid color-mix(in srgb,#ff5a5a 40%,transparent)}
/* modo claro: cores claras do grupo (amarelo, verde-limão…) ficam escurecidas
   nos textos, para dar para ler no tablet */
.fp:not(.fp-escuro) .fp-sci,.fp:not(.fp-escuro) .fp-badge{color:color-mix(in srgb,var(--glow-secondary) 50%,var(--text))}
.fp:not(.fp-escuro) .fp-badge{color:color-mix(in srgb,var(--glow-primary) 55%,var(--text))}
/* mapa solto (fora da ficha) */
.fp-mapa-solto{position:relative;isolation:isolate;z-index:0;min-height:380px;border-radius:16px;overflow:hidden;background:#0e1512}
.fp-mapa-solto.fp-mapa-escuro .leaflet-tile-pane{filter:invert(1) hue-rotate(180deg) brightness(.85) contrast(.9) saturate(.6)}
.fp-mapa-rotulo{display:inline-block;white-space:nowrap;padding:5px 10px;border-radius:999px;background:var(--mc);color:#0b130f;font:800 13px system-ui,sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.35);cursor:pointer}
/* pop-up */
html.fp-travado,html.fp-travado body{overflow:hidden}
.fp-pop{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:16px;background:rgba(10,6,18,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);animation:fpFade .2s ease}
.fp-box{width:min(1180px,100%);max-height:min(94vh,100%);display:flex;flex-direction:column;padding:0;overflow:hidden;animation:fpSobe .25s ease}
@keyframes fpSobe{from{transform:translateY(14px) scale(.98);opacity:0}to{transform:none;opacity:1}}
.fp-box-aviso{width:min(440px,100%)}
.fp-top{display:flex;justify-content:flex-end;padding:10px 10px 0;flex-shrink:0}
.fp .fp-x{width:46px;height:46px;border-radius:50%;border:1px solid var(--surface-line);background:var(--surface);color:var(--text);font-size:18px;font-weight:700;cursor:pointer;display:grid;place-items:center}
.fp .fp-x:hover{background:color-mix(in srgb,var(--glow-primary) 18%,transparent)}
.fp-corpo{overflow:auto;padding:0 20px 18px;-webkit-overflow-scrolling:touch}
.fp-ficha{padding-top:2px}
.fp-acoes{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;padding:14px 20px 18px;border-top:1px solid var(--surface-line);flex-shrink:0}
.fp .fp-btn{border:1px solid var(--surface-line);background:var(--surface);color:var(--text);border-radius:14px;padding:14px 22px;font:700 16px 'Hanken Grotesk',system-ui,sans-serif;cursor:pointer}
.fp .fp-btn.principal{border:0;color:#fff;background:linear-gradient(100deg,var(--glow-primary),var(--glow-secondary));box-shadow:0 10px 24px -10px var(--glow-primary)}
.fp-aviso{text-align:center;padding:4px 6px 6px}
.fp-aviso-ic{font-size:46px;line-height:1;margin-bottom:10px}
.fp-aviso h3{font-family:'Fraunces',Georgia,serif;font-size:22px;margin:0 0 8px}
.fp-aviso p{margin:0;font-size:16px;line-height:1.5}
.fp-aviso .fp-detalhe{margin-top:10px;font-size:13px;color:var(--text-dim)}
.fp-spinner{width:46px;height:46px;margin:6px auto 16px;border-radius:50%;border:4px solid color-mix(in srgb,var(--glow-primary) 25%,transparent);border-top-color:var(--glow-primary);animation:fpGira .8s linear infinite}
@keyframes fpGira{to{transform:rotate(360deg)}}
.fp-video{width:100%;border-radius:16px;background:#000;max-height:60vh}
/* tela larga (tablet deitado, notebook): conteúdo em duas colunas, para rolar menos */
@media (min-width:860px){
  .fp-box-ficha .fp-panel[data-panel="sobre"].on{display:grid;grid-template-columns:1fr 1fr;column-gap:32px;align-items:start}
  .fp-box-ficha .fp-panel[data-panel="sobre"].on>.fp-section:nth-child(2){margin-top:0}
  .fp-box-ficha .fp-panel[data-panel="local"].on,.fp-box-ficha .fp-panel[data-panel="habitat"].on{display:grid;grid-template-columns:3fr 2fr;column-gap:26px;align-items:start}
  .fp-box-ficha .fp-col-img .fp-map{margin-top:0;height:min(50vh,420px)}
  .fp-box-ficha .fp-col-info>:first-child{margin-top:0}
}
@media (max-width:420px){.fp-corpo{padding:0 14px 14px}.fp-pop{padding:8px}.fp{padding:16px}.fp-name{font-size:22px}.fp-foto{width:52px;height:52px}.fp-tab{font-size:11.5px;gap:4px}}
`;

  window.FichaPokedex = { configurar, mostrar, aviso, carregando, fechar, ligarCamera, escolherArquivo, trocarFotos, urlDaEspecie, mapaBiomas, BIOMAS };
})();
