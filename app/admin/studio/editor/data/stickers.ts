export interface Sticker {
  id: string;
  name: string;
  svgUri: string;
  category?: 'urgency' | 'icon' | 'badge';
}

// Converte SVG puro em Data URI Base64 seguro para evitar problemas de caracteres especiais (#, %, &, acentos)
const svgToDataUri = (svg: string): string => {
  const base64 = btoa(unescape(encodeURIComponent(svg.trim())));
  return `data:image/svg+xml;base64,${base64}`;
};

export const STICKERS: Sticker[] = [
  // Selos de Urgência & Gancho (Slide 1)
  {
    id: 'so-este-fim-de-semana',
    name: '🚨 Só Este Fim de Semana',
    category: 'urgency',
    svgUri: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 70" width="240" height="70">
        <rect x="5" y="5" width="230" height="60" rx="8" fill="#DC2626" stroke="#1A1A1A" stroke-width="4" transform="rotate(-3, 120, 35)"/>
        <rect x="10" y="10" width="220" height="50" rx="4" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="6 3" transform="rotate(-3, 120, 35)"/>
        <text x="120" y="42" font-family="'Arial Black', Impact, system-ui, sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" text-anchor="middle" transform="rotate(-3, 120, 35)" letter-spacing="0.5">🚨 SÓ ESTE FIM DE SEMANA</text>
      </svg>
    `),
  },
  {
    id: 'ultimos-dias',
    name: '⏳ Últimos Dias',
    category: 'urgency',
    svgUri: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190 65" width="190" height="65">
        <rect x="5" y="5" width="180" height="55" rx="28" fill="#FFC107" stroke="#1A1A1A" stroke-width="4" transform="rotate(2, 95, 32)"/>
        <text x="95" y="38" font-family="'Arial Black', Impact, system-ui, sans-serif" font-size="15" font-weight="900" fill="#1A1A1A" text-anchor="middle" transform="rotate(2, 95, 32)" letter-spacing="1">⏳ ÚLTIMOS DIAS</text>
      </svg>
    `),
  },
  {
    id: 'novo-em-lisboa',
    name: '✨ Novo em Lisboa',
    category: 'urgency',
    svgUri: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 65" width="200" height="65">
        <rect x="5" y="5" width="190" height="55" rx="8" fill="#00838F" stroke="#1A1A1A" stroke-width="4" transform="rotate(-2, 100, 32)"/>
        <rect x="10" y="10" width="180" height="45" rx="5" fill="none" stroke="#FFC107" stroke-width="2" transform="rotate(-2, 100, 32)"/>
        <text x="100" y="38" font-family="'Arial Black', Impact, system-ui, sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" text-anchor="middle" transform="rotate(-2, 100, 32)" letter-spacing="0.8">✨ NOVO EM LISBOA</text>
      </svg>
    `),
  },
  {
    id: 'selo-livre',
    name: "Selo 'ENTRADA LIVRE'",
    category: 'badge',
    svgUri: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 60" width="150" height="60">
        <rect x="5" y="5" width="140" height="50" fill="#FFC107" stroke="#1A1A1A" stroke-width="4" transform="rotate(-2, 75, 30)"/>
        <rect x="10" y="10" width="130" height="40" fill="none" stroke="#1A1A1A" stroke-width="2" stroke-dasharray="4 2" transform="rotate(-2, 75, 30)"/>
        <text x="75" y="36" font-family="'Arial Black', Impact, sans-serif" font-size="15" font-weight="900" fill="#1A1A1A" text-anchor="middle" transform="rotate(-2, 75, 30)">ENTRADA LIVRE</text>
      </svg>
    `),
  },
  {
    id: 'selo-gratis',
    name: "Selo '100% GRÁTIS'",
    category: 'badge',
    svgUri: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
        <circle cx="60" cy="60" r="54" fill="#FE7D02" stroke="#1A1A1A" stroke-width="4"/>
        <circle cx="60" cy="60" r="46" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="6 4"/>
        <text x="60" y="55" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#1A1A1A" text-anchor="middle" letter-spacing="1">100%</text>
        <text x="60" y="76" font-family="system-ui, sans-serif" font-size="16" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1.5">GRÁTIS</text>
        <path d="M25 60 L15 60 M95 60 L105 60 M60 25 L60 15 M60 95 L60 105" stroke="#1A1A1A" stroke-width="3" stroke-linecap="round"/>
      </svg>
    `),
  },
  {
    id: 'eletrico',
    name: 'Elétrico de Lisboa',
    category: 'icon',
    svgUri: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect x="15" y="30" width="70" height="45" rx="10" fill="#FFC107" stroke="#1A1A1A" stroke-width="4"/>
        <rect x="22" y="36" width="14" height="14" rx="2" fill="#FFFFFF" stroke="#1A1A1A" stroke-width="3"/>
        <rect x="43" y="36" width="14" height="14" rx="2" fill="#FFFFFF" stroke="#1A1A1A" stroke-width="3"/>
        <rect x="64" y="36" width="14" height="14" rx="2" fill="#FFFFFF" stroke="#1A1A1A" stroke-width="3"/>
        <rect x="25" y="75" width="12" height="12" rx="6" fill="#1A1A1A"/>
        <rect x="63" y="75" width="12" height="12" rx="6" fill="#1A1A1A"/>
        <path d="M50 10 L50 30 M35 10 L65 10" stroke="#1A1A1A" stroke-width="4" stroke-linecap="round"/>
        <circle cx="50" cy="62" r="4" fill="#FE7D02"/>
      </svg>
    `),
  },
  {
    id: 'pin-localizacao',
    name: 'Pin Brutalista',
    category: 'icon',
    svgUri: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <path d="M50 90 C25 60 20 45 20 35 A30 30 0 0 1 80 35 C80 45 75 60 50 90 Z" fill="#00838F" stroke="#1A1A1A" stroke-width="5" stroke-linejoin="round"/>
        <circle cx="50" cy="35" r="12" fill="#FFC107" stroke="#1A1A1A" stroke-width="3"/>
      </svg>
    `),
  },
  {
    id: 'seta-brutalista',
    name: 'Seta Brutalista',
    category: 'icon',
    svgUri: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <path d="M15 50 L85 50 M60 20 L85 50 L60 80" fill="none" stroke="#FE7D02" stroke-width="12" stroke-linecap="square" stroke-linejoin="miter"/>
        <rect x="5" y="44" width="15" height="12" fill="#1A1A1A"/>
      </svg>
    `),
  },
  {
    id: 'faisca',
    name: 'Faísca de Destaque',
    category: 'icon',
    svgUri: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <path d="M50 0 C50 35 65 50 100 50 C65 50 50 65 50 100 C50 65 35 50 0 50 C35 50 50 35 50 0 Z" fill="#FFC107" stroke="#1A1A1A" stroke-width="4"/>
      </svg>
    `),
  },
  {
    id: 'azulejo',
    name: 'Motivo de Azulejo',
    category: 'icon',
    svgUri: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect x="2" y="2" width="96" height="96" fill="#00838F" stroke="#1A1A1A" stroke-width="4"/>
        <rect x="15" y="15" width="70" height="70" fill="#FFFFFF" stroke="#1A1A1A" stroke-width="3"/>
        <path d="M50 15 L85 50 L50 85 L15 50 Z" fill="#FFC107" stroke="#1A1A1A" stroke-width="3"/>
        <circle cx="50" cy="50" r="16" fill="#FE7D02" stroke="#1A1A1A" stroke-width="3"/>
        <circle cx="50" cy="50" r="6" fill="#FFFFFF"/>
      </svg>
    `),
  },
];
