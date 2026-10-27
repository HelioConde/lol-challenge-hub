# ✦ LoL Challenge Hub — MVP estático

Painel pessoal para definir, revisar e acompanhar desafios de League of Legends **manualmente**. Não há conexão com Riot API, login, servidor ou banco de dados.

## Funcionalidades entregues
- Criar desafios com nome, prioridade, meta, progresso e observação.
- Acompanhar metas em andamento/concluídas, avançar +1, editar, excluir após confirmação e filtrar.
- Progresso salvo em LocalStorage no navegador.
- Três exemplos **fictícios e identificados**, carregados somente por escolha explícita.
- Importar/exportar backup JSON com validação; até 100 desafios por navegador.
- Interfaces responsivas e acessíveis, com controles semânticos, foco e movimento reduzido.

## GitHub Pages
Arquivos públicos: `index.html`, `styles.css`, `app.js`, `favicon.svg`, `.nojekyll`. Não requer build nem banco de dados. Caminhos são relativos para suportar `/lol-challenge-hub/`.

Fonte recomendada: Settings → Pages → Deploy from a branch → `gh-pages` → `/(root)`. A publicação só pode ser confirmada quando a configuração do repositório estiver habilitada e a URL HTTP responder.

## Rodar localmente
```bash
python -m http.server 8000
```
Abrir `http://localhost:8000`.

## QA
`node tests/static-qa.cjs` para verificações sem dependências; `.github/workflows/quality.yml` inclui Playwright Chromium com screenshots em cinco viewports, validação de formulário, progresso e persistência.

## Histórico
O README de concepção original está preservado na branch `archive/README-only-20261027`. Decisões e referências em [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md).

League of Legends pertence aos seus respectivos titulares. Projeto independente, não afiliado à Riot Games.
