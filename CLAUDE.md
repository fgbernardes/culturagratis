# CLAUDE.md — Cultura Grátis Lisboa (site)

Este ficheiro governa o Claude Code neste repositório. Não substitui as decisões de marca, editoriais e de governação do CGL 2.0 — essas vivem no projeto "Duarte" (chat), fora deste repositório. Filipe é a ponte entre os dois.

## 1. Contexto do projeto

Cultura Grátis Lisboa (CGL) é uma plataforma editorial de eventos culturais gratuitos. Âmbito editorial: exclusivamente o município de Lisboa — não a área metropolitana, salvo decisão expressa de Filipe.

Este repositório é o código do site (culturagratis.com), parte do relançamento CGL 2.0.

### Arquitetura de rotas (ADR-030) — multi-cidade

`culturagratis.com` vai alojar várias cidades no futuro. Lisboa vive em **`/lisboa`**, não na raiz.

- `/` faz redirect automático para `/lisboa` (por agora — enquanto só existir uma edição).
- Todas as páginas da edição Lisboa ficam sob `/lisboa/...` (agenda, categorias, freguesias, eventos, sobre, contactos).
- **Âmbito editorial continua só Lisboa** — isto é arquitetura de URLs, não expansão de conteúdo. Não confundir as duas coisas.
- Rotas já construídas hoje (Brevemente, `/design-tokens`, `/supabase-test`) estão na raiz — precisam de ser movidas para dentro de `/lisboa` (ou mantidas como exceções deliberadas — a página Brevemente pode fazer sentido continuar acessível em `/`, confirmar com Filipe antes de mover).

## 2. Stack

- Framework: Next.js
- Deploy / infraestrutura: Cloudflare Workers
- Base de dados: Supabase
- Gestão de conteúdo: por decidir — tendência atual para Git-based CMS [a confirmar]
- Página "Brevemente": já construída e testada. Não recriar — localizar e reutilizar. **Sem formulário de newsletter por agora — é intencional, não é falta a corrigir.** O formulário só entra quando o Teaser 3 (que revela o endereço do site) for publicado. Não adiantar isto sem confirmação de Filipe.

## 3. Estrutura do repositório

[A preencher quando este ficheiro for colocado no repositório real. Corre `/init` para gerar automaticamente, ou confirma com Filipe antes de assumir convenções.]

## 4. Sistema de marca — regras rígidas

Paleta oficial (design tokens v1.0, aprovada 07/08/2026):

| Cor | Hex | Uso |
|---|---|---|
| Laranja | `#FE7D02` | primária |
| Amarelo | `#FFC107` | primária |
| Antracite | `#1A1A1A` | texto / base |
| Branco | `#FFFFFF` | base |
| Tejo 500 (azul-petróleo) | `#00838F` | acento / focus — não usar no lettering do logótipo |

Tipografia:
- Display / títulos: **Bricolage Grotesque**
- Corpo de texto: **Inter**

Fonte de verdade: `CGL_design-tokens_v1.0.json`. Se este ficheiro for adicionado ao repositório, os valores vêm de lá — não hardcode sem confirmar primeiro.

**Nunca alterar paleta, tipografia ou logótipo sem confirmação explícita de Filipe.**

### Motivos obrigatórios da cidade

Decisão de Filipe, não negociável: **azulejo** (padrões geométricos) e **calçada portuguesa** (padrão Mar Largo) têm de entrar no sistema visual — ainda que como apontamentos.

- Entram como **forma/motivo** (texturas, padrões, molduras, divisores) — nunca como cor nova.
- Sempre dentro da paleta aprovada acima. Nunca usar as cores tradicionais do azulejo (azul/branco) ou da heráldica municipal.
- Aplicação obrigatória em três frentes: **site**, **cartazes de redes sociais**, **vídeos**.
- Paleta não muda por causa disto — confirmado por Filipe.

## 5. Taxonomia de eventos

Estrutura canónica: **8 categorias + 5 tags**, definida em `CGL_Taxonomias_MVP_v1.0.json` (ADR-016).

Não inventar categorias novas. Não usar taxonomias alternativas encontradas noutros ficheiros do projeto (ex.: sets de 18 categorias) — estão desalinhadas com a decisão em vigor.

## 6. Hierarquia de decisão

1. Instruções expressas de Filipe
2. ADRs aprovados
3. Documentos-fonte de verdade vigentes (Briefing, Manual da Fonte Display, design tokens)
4. Este ficheiro

Não decidas sozinho sobre: âmbito editorial, estrutura da taxonomia, paleta/tipografia, ou sequência/datas de lançamento. Pergunta.

## 7. Convenções de código

- TypeScript estrito
- Componentes funcionais React
- Estilos: **Tailwind** — decidido na prática, usado desde o início do projeto
- Mensagens de commit: **inglês** — decidido
- Testes: framework por decidir. Não bloqueia nada — só decidir quando houver código que justifique testes.

## 8. Quando falta contexto

Se precisares de uma decisão de marca, editorial ou de conteúdo que não está aqui, não inventes nem assumas. Pede a Filipe para trazer a resposta do projeto estratégico.

## 9. Nunca fazer

- Não publicar / fazer deploy sem confirmação explícita.
- Não expandir o âmbito editorial para além do município de Lisboa.
- Não gerar ou inserir conteúdo de eventos sem fonte confirmada.
- Não alterar decisões de marca já aprovadas.
