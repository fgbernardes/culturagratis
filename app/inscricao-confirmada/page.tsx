import Image from "next/image";
import Link from "next/link";

export default function SubscriptionConfirmed() {
  return (
    <main className="cgl-confirmed">
      <div className="cgl-confirmed-card">
        <Image src="/cgl-logo.png" alt="Cultura Grátis Lisboa" width="768" height="768" priority unoptimized />
        <p className="cgl-confirmed-eyebrow">Subscrição confirmada</p>
        <h1>Ficaste na lista!</h1>
        <div className="cgl-confirmed-copy">
          <p>Obrigado por nos acompanhares.</p>
          <p>Vamos levar a sério a promessa de não te entupir a caixa de e-mail de spam.</p>
          <p>O primeiro e-mail que te vamos enviar será o anúncio do lançamento do site, com uma breve descrição da história do Cultura Grátis. Os próximos serão eventos para adicionares à agenda. Eventos, claro, grátis! ;)</p>
        </div>
        <Link href="/">Voltar ao início</Link>
      </div>
    </main>
  );
}
