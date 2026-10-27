# Design System — LoL Challenge Hub

## Objetivo
Um painel de objetivos pessoais com identidade gamer limpa, tons noturnos e detalhes dourados. O projeto é autocontido em HTML, CSS e JavaScript. Não representa dados verificados nem oferece automação Riot.

## Taste Skill
Fonte de verdade: `styles.css`, tokens `--bg #0e1527`, `--surface #15223a`, `--raised #1d2d48`, `--gold #efce83`, `--teal #8be8cb`, `--text #f4f6fa`, `--focus #ffe19e`. Espaçamento `--space-1/2/3/4/5/6/8/12/16` (4–64px). Raios 10, 18 e 30px. Tipografia nativa.

## Web Design Guidelines
- HTML com `main`, `nav`, labels e skip link; botões e links reais; regiões anunciadas via `role=status`.
- Filtros com `aria-pressed`, elemento `progress` com `aria-label`, foco de teclado visível, confirmação para exclusão/importação destrutiva.
- Layout mobile-first responsivo, 320/390/768/1366/1600 px, `prefers-reduced-motion` sem deslocamentos animados, alvos >=44px.
- Dados de usuário via `textContent`/DOM, sem HTML injetado. Controles sem drag obrigatório.

## Awesome Design / Image to Code
Referência visual é a linguagem temática de desafios de jogos, com emblema original em CSS e um favicon SVG criado no repositório. Não simular conversão de uma captura inexistente. Priorizar estados vazios úteis, cartões escaneáveis e clareza editorial sobre métricas.

## Persistência, limites e segurança
- Chave `lol-challenge-hub-local-v1`: objeto `{version:1,challenges:[...]} ` no LocalStorage. Backup JSON versionado.
- Limite de 100 desafios; título até 70 caracteres; meta 1–10.000; progresso 0–meta; observação até 500 caracteres.
- Sem sincronização, contas, API, telemetria ou envio dos dados. Armazenamento não é criptografado; não registre dados sensíveis.
- Em caso de bloqueio de LocalStorage, continuar em memória e avisar para exportar.

## Testes
`tests/static-qa.cjs` verifica estrutura e não dependência do backend. `tests/browser-qa.cjs` testa fluxos criar, avançar, filtrar, reload, excluir, JSON, erros e overflow com Chromium, salvando screenshots completos em 5 viewports.
