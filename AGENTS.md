# Instruções para agentes

Este repositório é trabalhado por mais do que um agente (Codex e Claude Code) e pelo Filipe.
Todos os agentes leem este ficheiro antes de começar e atualizam-no quando mudam uma convenção.

## Comunicação entre agentes

- **Antes de começar:** ler este ficheiro, a secção "Notas entre agentes" abaixo e os PRs abertos.
- **Ao mudar uma convenção** (comandos, estrutura de testes, padrões de código): atualizar as regras
  deste ficheiro no mesmo commit.
- **Ao terminar um trabalho:** acrescentar uma entrada curta em "Notas entre agentes" (data, agente,
  ramo ou PR, o que mudou, o que fica pendente). Mensagens de commit e descrições de PR explicam o
  porquê, não apenas o quê.
- Não reescrever o histórico de um ramo que outro agente esteja a usar; juntar a `main` com merge.
- Remover notas quando deixarem de ser úteis (PR integrado e sem pendentes).

## Testes

- `npm test` compila (`npm run build`, ~15 s) e corre todos os testes. Usar depois de mudar código
  da aplicação.
- `npm run test:only` corre os testes sem compilar. Só é fiável se `dist/` estiver atualizado.
- Os testes usam `node:test` e ficam em `tests/*.test.mjs`.
- Só `rendered-html.test.mjs` e `independent-architecture.test.mjs` leem `dist/`; os restantes
  leem o código-fonte.

### `tests/rendered-html.test.mjs`

- O Worker compilado (`dist/server/index.js`) é importado **uma única vez**, no `before()`.
  Os pedidos passam pelo `render(path, init, env)`.
- Não voltar a importar o Worker dentro de cada teste nem acrescentar `?test=...` ao URL do import:
  torna o ficheiro cerca de 2x mais lento e não isola nada, porque o estado do vinext vive em
  `globalThis`.
- Para simular serviços externos (Brevo, Turnstile), substituir `globalThis.fetch` dentro do teste
  e repô-lo num `finally`, como no teste do Brevo.

## Notas entre agentes

- **2026-09-24 · Claude Code · PR fgbernardes/culturagratis#9 (`claude/slowest-test-analysis-3vtuq4`):** `rendered-html`
  passou a importar o Worker uma vez (ficheiro de ~780 ms para ~490 ms); novo `npm run test:only`.
  Pendente: integração do PR pelo Filipe.
