# 🧰 Ferramentas (opcional)

Scripts em Python que aceleram o trabalho quando são **muitos grupos**. Dá para fazer tudo à mão seguindo o [guia](../GUIA-PROFESSORES.md); estes scripts só automatizam as partes repetitivas.

> Precisa de Python 3 e, para o `montar.py`, da biblioteca Pillow (`pip install pillow`).

| Script | O que faz |
|---|---|
| `extrair_missoes.py` | Lê o documento **"Meu Back-End — Pokédex"** (`.docx`) do grupo e devolve as missões em JSON |
| `gerar_missoes.py` | Transforma esse JSON no `missoes.js` do grupo, completando as missões em branco com o exemplo do documento e anotando as pendências |
| `montar.py` | Copia o front do grupo para `grupos/<apelido>/index.html`, diminui as imagens muito pesadas e cola no final o bloco que liga o front à ficha em pop-up |

## Passo a passo com os scripts

```bash
# 1) missões do documento do grupo -> JSON (confira e corrija à mão se precisar)
python3 -I ferramentas/extrair_missoes.py "Backend da Pokedéx.docx" > missoes.json

# 2) ajustes do grupo (nome, primeiros nomes, correções) -> veja exemplo-ajustes.json
#    e gere o missoes.js
mkdir -p grupos/escola-t1-lider
python3 -I ferramentas/gerar_missoes.py grupos/escola-t1-lider/missoes.js missoes.json ajustes.json

# 3) front do grupo + configuração (modelo/ligar-no-front.html, só o PokedexAdaptador.iniciar)
python3 -I ferramentas/montar.py . escola-t1-lider "front-do-grupo.html" config.js
```

O `montar.py` aceita um 5º argumento opcional, um JSON de substituições pontuais no HTML do grupo (para consertar um bug do front, por exemplo):

```json
[{ "de": "texto exato que está no HTML", "para": "texto novo" }]
```

## O arquivo de ajustes

```json
{
  "slug": "adherbal-t2-caroline",
  "escola": "Adherbal",
  "turma": "Turma 2",
  "grupo": { "nome": "FrutAI", "integrantes": "Caroline, Manuela, Pedro e Erick", "tema": "Frutas brasileiras" },
  "sobrescrever": { "acerto": ["Com certeza é um(a)", "! Achei muito legal!!"] },
  "observacoes": ["O que foi corrigido e por quê (vai para o topo do missoes.js)."],
  "pendencias": ["Missão 3 (por que escolheram 60)"]
}
```

- `sobrescrever`: troca qualquer missão (`ESPECIALISTA`, `O_QUE_PROCURAR`, `CERTEZA_MINIMA`, `nao_foto`, `grande`, `duvida`, `acerto`).
- `pendencias`: aparecem em amarelo no painel. As missões em branco entram aqui sozinhas.
- Use **só o primeiro nome** dos alunos: o site é público.
