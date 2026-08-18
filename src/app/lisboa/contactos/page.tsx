import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contactos",
  description: "Contacto da Cultura Grátis Lisboa.",
};

export default function Contactos() {
  return (
    <main className="flex flex-1 flex-col items-center px-16 py-24">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Contactos
        </h1>
        <p className="font-sans leading-relaxed text-antracite/80">
          Para questões, sugestões ou correções, escreve para{" "}
          <a
            href="mailto:ola@culturagratis.com"
            className="text-tejo-500 underline underline-offset-4"
          >
            ola@culturagratis.com
          </a>
          .
        </p>
      </div>
    </main>
  );
}
