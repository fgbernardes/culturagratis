import type { CSSProperties } from "react";

type VerificationProps = {
  verifiedAt: string;
  size?: number;
  className?: string;
};

export function VerificationSeal({ verifiedAt, size = 64, className = "" }: VerificationProps) {
  const date = formatVerificationDate(verifiedAt);
  const style = { "--cgl-verify-size": `${size}px` } as CSSProperties;

  return (
    <span
      className={`cgl-verify-seal ${className}`.trim()}
      style={style}
      role="img"
      aria-label={`Informação verificada pelo Cultura Grátis Lisboa em ${date}`}
      title={`Verificado pelo CGL em ${date}`}
    >
      <span className="cgl-verify-check" aria-hidden="true">✓</span>
      <span className="cgl-verify-seal-center" aria-hidden="true">
        <img src="/cgl-verifica-tram.png" alt="" />
        <strong>VERIFICADO</strong>
        <small>CGL</small>
      </span>
    </span>
  );
}

export function VerificationChip({ verifiedAt, className = "" }: VerificationProps) {
  const date = formatVerificationDate(verifiedAt);

  return (
    <span
      className={`cgl-verify-chip ${className}`.trim()}
      aria-label={`Informação verificada pelo Cultura Grátis Lisboa em ${date}`}
      title={`Verificado pelo CGL em ${date}`}
    >
      <span className="cgl-verify-chip-mark" aria-hidden="true">
        <img src="/cgl-verifica-tram.png" alt="" />
        <b>✓</b>
      </span>
      <span><strong>Verificado</strong><small>CGL · {date}</small></span>
    </span>
  );
}

export function formatVerificationDate(value: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/Lisbon",
  }).format(new Date(value));
}
