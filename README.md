# Cultura Grátis Lisboa

Aplicação Next.js/Vinext independente, executada num Cloudflare Worker e ligada ao projeto Supabase do CGL na região `eu-west-1`.

## Arquitetura

- frontend e API: Next.js App Router compilado por Vinext;
- alojamento: Cloudflare Workers na conta do CGL;
- dados: Supabase PostgreSQL (`vcxhhbrwwltzvytcszpx`, UE);
- autenticação administrativa: Supabase Auth;
- backoffice: `/admin`;
- newsletter: Brevo, chamada apenas no servidor;
- proteção de formulários: Cloudflare Turnstile.

Não existem dependências de execução, autenticação ou publicação em ChatGPT Sites.

## Desenvolvimento

```bash
npm ci
cp .dev.vars.example .dev.vars
npm run dev
```

Preencher `.dev.vars` apenas localmente. O ficheiro é ignorado pelo Git.

## Base de dados

As migrações PostgreSQL estão em `supabase/migrations`. A migração principal:

- cria `events`, `submissions` e `newsletter_subscribers`;
- ativa RLS em todas as tabelas;
- revoga acesso a `anon` e `authenticated`;
- permite acesso de dados apenas ao cliente de servidor;
- cria uma função transacional para submissão e consentimento de newsletter.

O segredo Supabase nunca pode usar o prefixo `NEXT_PUBLIC_` nem ser enviado ao navegador.

## Segredos do Worker

Configurar com `wrangler secret put`:

- `SUPABASE_SECRET_KEY`
- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `TURNSTILE_EXPECTED_HOSTNAME`
- `BREVO_API_KEY`
- `BREVO_DOI_TEMPLATE_ID`
- `BREVO_CONTACT_LIST_ID`
- `BREVO_DOI_REDIRECT_URL`

## Testes e publicação

```bash
npm test
npm run deploy
```

`npm test` compila antes de correr os testes. Com `dist/` já atualizado, `npm run test:only` corre só os testes.

As regras para agentes (Codex, Claude Code) e as notas entre eles estão em `AGENTS.md`.

O domínio só deve ser associado ao Worker depois de a URL técnica `workers.dev` passar os testes de homepage, agenda, formulários e `/admin`.
