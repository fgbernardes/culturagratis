import Link from "next/link";

const navLinks = [
  { href: "/lisboa", label: "Agenda" },
  { href: "/lisboa/categorias", label: "Categorias" },
  { href: "/lisboa/freguesias", label: "Freguesias" },
  { href: "/lisboa/sobre", label: "Sobre" },
  { href: "/lisboa/contactos", label: "Contactos" },
];

export default function LisboaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <nav className="flex flex-wrap items-center justify-center gap-6 border-b border-antracite/10 px-16 py-4 font-sans text-sm">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-antracite/70 transition-colors hover:text-tejo-500"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
