const swatches = [
  { nome: "Laranja", classe: "bg-laranja" },
  { nome: "Amarelo", classe: "bg-amarelo" },
  { nome: "Antracite", classe: "bg-antracite" },
  { nome: "Branco", classe: "bg-branco border border-antracite/20" },
  { nome: "Tejo 500", classe: "bg-tejo-500" },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center gap-10 px-16 py-32">
      <h1 className="font-display text-4xl font-semibold tracking-tight">
        Cultura Grátis Lisboa
      </h1>
      <p className="max-w-md text-center font-sans text-lg leading-8">
        Página de teste para confirmar visualmente os tokens de marca — tipografia
        e paleta de cores do design system CGL.
      </p>
      <div className="flex flex-wrap justify-center gap-6">
        {swatches.map((swatch) => (
          <div key={swatch.nome} className="flex flex-col items-center gap-2">
            <div className={`h-24 w-24 rounded-lg ${swatch.classe}`} />
            <span className="font-sans text-sm">{swatch.nome}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
