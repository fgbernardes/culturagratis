"use client";

import { CSSProperties, useId } from "react";

type Access52BadgeProps = {
  variant?: "full" | "compact";
  size?: number;
  className?: string;
};

const ACCESS52_LABEL = "Acesso 52 — classificação editorial do Cultura Grátis Lisboa para dias de entrada gratuita destinados a residentes em Portugal";

export function Access52Badge({ variant = "full", size, className = "" }: Access52BadgeProps) {
  const ringId = useId().replace(/:/g, "");
  const style = size ? ({ "--access52-size": `${size}px` } as CSSProperties) : undefined;

  if (variant === "compact") {
    return (
      <span
        className={`access52-badge access52-badge-compact ${className}`.trim()}
        style={style}
        role="img"
        aria-label={ACCESS52_LABEL}
      >
        <span className="access52-compact-cgl">CGL</span>
        <span className="access52-compact-access">ACESSO</span>
        <strong>52</strong>
        <span className="access52-compact-free">GRÁTIS</span>
      </span>
    );
  }

  return (
    <span
      className={`access52-badge access52-badge-full ${className}`.trim()}
      style={style}
      role="img"
      aria-label={ACCESS52_LABEL}
    >
      <svg className="access52-ring-copy" viewBox="0 0 200 200" aria-hidden="true">
        <defs>
          <path id={ringId} d="M 100,100 m -82,0 a 82,82 0 1,1 164,0 a 82,82 0 1,1 -164,0" />
        </defs>
        <text>
          <textPath href={`#${ringId}`} startOffset="0%">
            RESIDENTES EM PORTUGAL · MUSEUS · MONUMENTOS · PALÁCIOS · CGL ·
          </textPath>
        </text>
      </svg>

      <span className="access52-tile-frame" aria-hidden="true">
        <span className="access52-center">
          <img src="/acesso52-microemblem.png" alt="" />
          <span className="access52-wordmark">
            <span>ACESSO</span>
            <strong>52</strong>
            <span>DIAS GRÁTIS</span>
          </span>
        </span>
      </span>
    </span>
  );
}
