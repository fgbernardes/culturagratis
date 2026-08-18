import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "A Cultura Grátis Lisboa é uma plataforma editorial de eventos culturais gratuitos, com âmbito exclusivo ao município de Lisboa.",
};

export default function Sobre() {
  return (
    <main className="flex flex-1 flex-col items-center px-16 py-24">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Sobre
        </h1>
        <p className="font-sans leading-relaxed text-antracite/80">
          A Cultura Grátis Lisboa (CGL) é uma plataforma editorial de eventos
          culturais gratuitos. O âmbito editorial é exclusivamente o
          município de Lisboa.
        </p>
      </div>
    </main>
  );
}
