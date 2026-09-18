import Link from "next/link";
import { cglLogoColor } from "../../brand-assets";
import { requireAdminPageUser } from "../../admin-auth";
import AdminWorkspaceNav from "../../components/admin-workspace-nav";

export const dynamic = "force-dynamic";

const collections = [
  { title: "Governação e decisões", eyebrow: "Fonte normativa", description: "Registo de decisões, ADRs, memória partilhada e regras de autoridade documental.", links: [{ label: "Registo de decisões vigente", href: "https://drive.google.com/drive/folders/1EQiWgk3Kv0AMH4LyyklzPWl5KaLgEj2r" }, { label: "Memória partilhada IA", href: "https://drive.google.com/drive/folders/1PA9MeTGIpAo2WEwcsfm45EUhBN9yz2m9" }] },
  { title: "Marca e identidade", eyebrow: "Brand OS", description: "Logótipos, tipografia, paleta, tokens, selos e direção Lisboa Material.", links: [{ label: "Documentação de marca", href: "https://drive.google.com/drive/folders/1EQiWgk3Kv0AMH4LyyklzPWl5KaLgEj2r" }] },
  { title: "Operação editorial", eyebrow: "Uso diário", description: "Critérios de gratuitidade, fontes culturais, acessibilidade e processo de verificação.", links: [{ label: "Abrir Gestão editorial", href: "/admin" }, { label: "Abrir Studio CGL", href: "/admin/studio" }] },
  { title: "Site e técnica", eyebrow: "Implementação", description: "Arquitetura, segurança, deploy, Supabase, Cloudflare e procedimentos de validação.", links: [{ label: "Abrir Dashboard", href: "/admin/dashboard" }, { label: "Repositório do site", href: "https://github.com/fgbernardes/culturagratis" }] },
];

export default async function BibliotecaPage() {
  const { user, allowed } = await requireAdminPageUser("/admin/biblioteca");
  return (
    <main className="admin-shell">
      <header className="admin-header"><Link className="subpage-brand" href="/"><img src={cglLogoColor} alt="" width="58" height="58" /><span>Cultura Grátis Lisboa</span></Link><div><span>{user.displayName}</span><Link href="/admin/logout">Terminar sessão</Link></div></header>
      <AdminWorkspaceNav active="biblioteca" />
      {!allowed ? <section className="admin-denied"><h2>Acesso reservado</h2><p>Esta área contém documentação interna do CGL.</p><strong>{user.email}</strong></section> : <>
        <section className="admin-hero"><p>BIBLIOTECA CGL</p><h1>A memória certa, no sítio certo.</h1><span>Consulta a documentação de referência sem misturar decisões, rascunhos e arquivo.</span></section>
        <div className="admin-library-grid">{collections.map((collection) => <article className="admin-library-card" key={collection.title}><p>{collection.eyebrow}</p><h2>{collection.title}</h2><span>{collection.description}</span><div>{collection.links.map((link) => <a key={link.label} href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noreferrer" : undefined}>{link.label} ↗</a>)}</div></article>)}</div>
        <section className="admin-library-note"><strong>Regra operacional</strong><span>A Biblioteca começa como índice controlado. Upload, versionamento e permissões documentais entram numa segunda fase, ligados a uma fonte de verdade explícita.</span></section>
      </>}
    </main>
  );
}
