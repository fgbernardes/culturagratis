import Image from "next/image";
import Link from "next/link";
import { PublicHeader, PublicFooter } from "../components/public-chrome";
import { isPrelaunchMode } from "../launch-state";

export default async function SubscriptionConfirmed() {
  const prelaunch = await isPrelaunchMode();
  return (
    <main className="cgl-confirmed-shell">
      {prelaunch ? null : <PublicHeader />}
      <div className="cgl-confirmed">
      <div className="cgl-confirmed-card">
        <Image src="/cgl-logo.png" alt="Cultura Grátis Lisboa" width="768" height="768" priority unoptimized />
        <p className="cgl-confirmed-eyebrow">Subscrição confirmada</p>
        <h1>Ficaste na lista!</h1>
        <div className="cgl-confirmed-copy">
          <p>Obrigado por nos acompanhares.</p>
          <p>Vamos levar a sério a promessa de não te entupir a caixa de e-mail de spam.</p>
          <p>{prelaunch ? "O primeiro e-mail será o anúncio do lançamento do site. Depois enviamos eventos gratuitos para juntares à agenda." : "Vamos enviar-te eventos gratuitos em Lisboa para juntares à agenda."}</p>
        </div>
        <Link href="/">Voltar ao início</Link>
      </div>
      </div>
      {prelaunch ? null : <PublicFooter />}
    </main>
  );
}
