export const CGL_VECTOR_PALETTES = {
  sunset: ['#FE7D02', '#FFC107', '#1A1A1A'],
  tejo: ['#00838F', '#FFC107', '#FFFFFF'],
  charcoal: ['#1A1A1A', '#FE7D02', '#FFFFFF'],
  full: ['#FE7D02', '#FFC107', '#00838F', '#1A1A1A'],
} as const;

export type VectorPaletteId = keyof typeof CGL_VECTOR_PALETTES;
export type VectorShapeId =
  | 'urban-lines'
  | 'skyline'
  | 'city-block'
  | 'garden'
  | 'tree'
  | 'plant'
  | 'bicycle'
  | 'car'
  | 'tram'
  | 'streetlamp'
  | 'crosswalk'
  | 'map';

export interface VectorShapeOptions {
  palette?: readonly string[];
  variation?: number;
  density?: number;
  strokeWidth?: number;
}

export interface VectorShapePreset {
  id: VectorShapeId;
  name: string;
  description: string;
  category: 'estrutura' | 'natureza' | 'mobilidade' | 'sinalética';
  render: (options: Required<VectorShapeOptions>) => string;
}

const VIEWBOX = '0 0 600 600';

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character] || character);
}

function hashSeed(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function random(seed: number) {
  let current = seed || 1;
  return () => {
    current = Math.imul(48271, current) % 2147483647;
    return (current & 2147483647) / 2147483647;
  };
}

function normalizeOptions(options: VectorShapeOptions = {}): Required<VectorShapeOptions> {
  return {
    palette: options.palette?.length ? options.palette : CGL_VECTOR_PALETTES.full,
    variation: Math.max(0, Math.min(99, Math.round(options.variation ?? 1))),
    density: Math.max(1, Math.min(5, Math.round(options.density ?? 3))),
    strokeWidth: Math.max(2, Math.min(14, Math.round(options.strokeWidth ?? 6))),
  };
}

function svg(content: string, options: Required<VectorShapeOptions>, label: string) {
  const palette = options.palette.map(escapeXml).join('|');
  const rotation = ((options.variation * 13) % 17) - 8;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" role="img" aria-label="${escapeXml(label)}" data-cgl-palette="${palette}"><g transform="rotate(${rotation} 300 300)">${content}</g></svg>`;
}

function line(x1: number, y1: number, x2: number, y2: number, color: string, width: number, extra = '') {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" ${extra}/>`;
}

function path(d: string, color: string, width: number, extra = '') {
  const fillAttribute = /\bfill=/.test(extra) ? '' : 'fill="none"';
  return `<path d="${d}" ${fillAttribute} stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
}

function circle(cx: number, cy: number, radius: number, color: string, width: number, fill = 'none') {
  return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${fill}" stroke="${color}" stroke-width="${width}"/>`;
}

function rect(x: number, y: number, width: number, height: number, color: string, strokeWidth: number, fill = 'none', radius = 0) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${fill}" stroke="${color}" stroke-width="${strokeWidth}"/>`;
}

function renderUrbanLines(options: Required<VectorShapeOptions>) {
  const colours = options.palette;
  const count = 4 + options.density * 2;
  const rng = random(hashSeed(`urban-lines-${options.variation}`));
  let content = '';
  for (let index = 0; index < count; index += 1) {
    const y = 90 + index * (420 / count);
    const bend = 30 + rng() * 110;
    const direction = index % 2 === 0 ? 1 : -1;
    const d = `M ${30 + index * 9} ${y + 20} C ${160 + bend * direction} ${y - 90}, ${250 - bend * direction} ${y + 140}, 330 ${y + 40} S ${480 - bend * direction} ${y - 20}, ${570 - index * 8} ${y + 90}`;
    content += path(d, colours[index % colours.length], options.strokeWidth - 1, `opacity="${0.35 + (index % 3) * 0.2}"`);
  }
  return svg(content, options, 'Linhas urbanas');
}

function renderSkyline(options: Required<VectorShapeOptions>) {
  const colours = options.palette;
  const rng = random(hashSeed(`skyline-${options.variation}`));
  const count = 4 + options.density;
  let content = line(35, 480, 565, 480, colours[0], options.strokeWidth);
  for (let index = 0; index < count; index += 1) {
    const x = 52 + index * (490 / count);
    const width = 52 + rng() * 45;
    const height = 130 + rng() * (180 + options.density * 24);
    const colour = colours[(index + 1) % colours.length];
    content += rect(x, 480 - height, width, height, colour, options.strokeWidth, index % 2 ? 'none' : `${colour}18`, 2);
    for (let row = 0; row < 3; row += 1) {
      content += line(x + 14, 420 - row * 36 - (480 - height < 230 ? 0 : 20), x + width - 14, 420 - row * 36 - (480 - height < 230 ? 0 : 20), colour, Math.max(2, options.strokeWidth - 3), `opacity="0.7"`);
    }
  }
  content += path('M 35 500 C 150 470, 250 525, 370 492 S 510 470, 565 505', colours[0], Math.max(3, options.strokeWidth - 1));
  return svg(content, options, 'Linha de edifícios urbanos');
}

function renderCityBlock(options: Required<VectorShapeOptions>) {
  const colours = options.palette;
  const width = options.strokeWidth;
  let content = `<g transform="rotate(${options.variation % 2 ? -4 : 4} 300 300)">`;
  content += rect(110, 110, 380, 380, colours[0], width, `${colours[0]}12`, 12);
  content += rect(175, 175, 250, 250, colours[2 % colours.length], width, 'none', 8);
  content += line(110, 300, 175, 300, colours[1 % colours.length], width);
  content += line(425, 300, 490, 300, colours[1 % colours.length], width);
  content += line(300, 110, 300, 175, colours[1 % colours.length], width);
  content += line(300, 425, 300, 490, colours[1 % colours.length], width);
  content += circle(300, 300, 58, colours[1 % colours.length], Math.max(3, width - 1), `${colours[1 % colours.length]}24`);
  for (let index = 0; index < 4 + options.density; index += 1) {
    const offset = 132 + index * 42;
    content += line(offset, 132, offset + 22, 132, colours[0], Math.max(2, width - 2));
    content += line(offset, 468, offset + 22, 468, colours[0], Math.max(2, width - 2));
  }
  content += '</g>';
  return svg(content, options, 'Quarteirão e espaço público');
}

function renderGarden(options: Required<VectorShapeOptions>) {
  const colours = options.palette;
  const width = options.strokeWidth;
  let content = path('M 90 420 C 135 315, 205 290, 300 320 S 465 300, 510 420', colours[0], width, `fill="${colours[0]}12"`);
  content += path('M 90 420 C 220 390, 370 450, 510 420', colours[1 % colours.length], width);
  for (let index = 0; index < 5 + options.density; index += 1) {
    const x = 125 + index * 55;
    const y = 372 - (index % 2) * 25;
    content += path(`M ${x} ${y + 30} Q ${x - 12} ${y} ${x} ${y - 22} Q ${x + 12} ${y} ${x} ${y + 30}`, colours[(index + 1) % colours.length], Math.max(2, width - 2), `fill="${colours[(index + 1) % colours.length]}20"`);
  }
  content += path('M 145 245 C 205 180, 395 180, 455 245', colours[2 % colours.length], Math.max(2, width - 2), 'stroke-dasharray="12 16"');
  return svg(content, options, 'Jardim urbano');
}

function renderTree(options: Required<VectorShapeOptions>) {
  const colours = options.palette;
  const width = options.strokeWidth;
  let content = path('M 296 475 C 294 410, 290 350, 275 290', colours[0], width);
  content += path('M 297 410 C 260 385, 238 350, 225 315 M 292 370 C 330 342, 350 305, 365 270', colours[0], Math.max(3, width - 1));
  content += circle(245, 245, 65, colours[1 % colours.length], width, `${colours[1 % colours.length]}20`);
  content += circle(350, 220, 78, colours[2 % colours.length], width, `${colours[2 % colours.length]}20`);
  content += circle(410, 278, 58, colours[1 % colours.length], width, `${colours[1 % colours.length]}20`);
  content += path('M 180 475 C 250 450, 355 450, 435 475', colours[0], Math.max(3, width - 1));
  return svg(content, options, 'Árvore urbana');
}

function renderPlant(options: Required<VectorShapeOptions>) {
  const colours = options.palette;
  const width = options.strokeWidth;
  let content = rect(215, 385, 170, 95, colours[0], width, `${colours[0]}18`, 12);
  content += path('M 300 385 C 300 320, 285 260, 250 205 M 300 345 C 300 285, 330 230, 365 190', colours[1 % colours.length], width);
  content += path('M 250 205 C 205 180, 175 205, 245 235 C 260 240, 270 225, 250 205 Z', colours[2 % colours.length], Math.max(2, width - 2), `fill="${colours[2 % colours.length]}22"`);
  content += path('M 365 190 C 405 160, 445 190, 375 230 C 360 235, 350 215, 365 190 Z', colours[1 % colours.length], Math.max(2, width - 2), `fill="${colours[1 % colours.length]}22"`);
  content += path('M 300 315 C 255 285, 220 305, 290 345 C 305 348, 312 330, 300 315 Z', colours[0], Math.max(2, width - 2), `fill="${colours[0]}22"`);
  return svg(content, options, 'Planta em vaso');
}

function renderBicycle(options: Required<VectorShapeOptions>) {
  const colours = options.palette;
  const width = options.strokeWidth;
  let content = circle(170, 390, 76, colours[0], width);
  content += circle(430, 390, 76, colours[0], width);
  content += path('M 170 390 L 250 270 L 330 390 L 430 390 L 290 335 L 250 270 L 355 265 M 290 335 L 350 390', colours[1 % colours.length], width);
  content += line(250, 270, 232, 245, colours[2 % colours.length], width);
  content += line(350, 265, 375, 240, colours[2 % colours.length], width);
  content += line(350, 240, 390, 238, colours[2 % colours.length], width);
  content += circle(290, 335, 11, colours[1 % colours.length], Math.max(2, width - 2), colours[1 % colours.length]);
  return svg(content, options, 'Bicicleta urbana');
}

function renderCar(options: Required<VectorShapeOptions>) {
  const colours = options.palette;
  const width = options.strokeWidth;
  let content = path('M 120 390 L 155 295 Q 170 255 225 250 L 375 250 Q 430 255 445 295 L 480 390 Z', colours[0], width, `fill="${colours[0]}18"`);
  content += path('M 205 260 L 230 315 L 370 315 L 395 260', colours[1 % colours.length], width);
  content += line(145, 350, 455, 350, colours[2 % colours.length], Math.max(2, width - 2));
  content += circle(205, 395, 30, colours[0], width, colours[2 % colours.length]);
  content += circle(395, 395, 30, colours[0], width, colours[2 % colours.length]);
  content += line(133, 325, 165, 325, colours[1 % colours.length], width);
  content += line(435, 325, 467, 325, colours[1 % colours.length], width);
  return svg(content, options, 'Carro urbano');
}

function renderTram(options: Required<VectorShapeOptions>) {
  const colours = options.palette;
  const width = options.strokeWidth;
  let content = rect(135, 185, 330, 230, colours[0], width, `${colours[0]}18`, 18);
  content += rect(175, 230, 80, 70, colours[1 % colours.length], Math.max(2, width - 2), `${colours[1 % colours.length]}18`, 5);
  content += rect(275, 230, 80, 70, colours[1 % colours.length], Math.max(2, width - 2), `${colours[1 % colours.length]}18`, 5);
  content += line(300, 185, 300, 130, colours[2 % colours.length], width);
  content += path('M 250 130 Q 300 90 350 130', colours[2 % colours.length], width);
  content += line(175, 355, 425, 355, colours[0], width);
  content += circle(205, 430, 24, colours[0], width, colours[2 % colours.length]);
  content += circle(395, 430, 24, colours[0], width, colours[2 % colours.length]);
  content += line(95, 470, 505, 470, colours[1 % colours.length], Math.max(3, width - 1));
  content += line(120, 500, 480, 500, colours[1 % colours.length], Math.max(3, width - 1));
  return svg(content, options, 'Elétrico de Lisboa');
}

function renderStreetlamp(options: Required<VectorShapeOptions>) {
  const colours = options.palette;
  const width = options.strokeWidth;
  let content = line(300, 500, 300, 180, colours[0], width);
  content += path('M 300 190 C 300 130, 365 125, 390 165 L 390 210', colours[0], width);
  content += path('M 365 200 Q 390 160 420 200 L 405 235 L 380 235 Z', colours[1 % colours.length], width, `fill="${colours[1 % colours.length]}32"`);
  content += path('M 375 300 L 225 365 M 225 365 L 195 345 M 225 365 L 210 395', colours[2 % colours.length], Math.max(2, width - 2));
  content += path('M 160 500 C 240 470, 365 530, 470 490', colours[1 % colours.length], Math.max(3, width - 1));
  return svg(content, options, 'Candeeiro urbano');
}

function renderCrosswalk(options: Required<VectorShapeOptions>) {
  const colours = options.palette;
  const width = options.strokeWidth;
  let content = path('M 90 460 L 510 460 M 105 510 L 495 510', colours[0], width);
  for (let index = 0; index < 4 + options.density; index += 1) {
    const x = 120 + index * 55;
    content += path(`M ${x} 460 L ${x + 30} 510`, colours[(index + 1) % colours.length], width);
  }
  content += circle(300, 245, 90, colours[1 % colours.length], width, `${colours[1 % colours.length]}18`);
  content += path('M 300 180 L 300 315 M 245 255 L 355 255 M 270 330 L 300 370 L 330 330', colours[2 % colours.length], width);
  return svg(content, options, 'Sinal de atravessamento urbano');
}

function renderMap(options: Required<VectorShapeOptions>) {
  const colours = options.palette;
  const width = options.strokeWidth;
  let content = path('M 85 180 C 180 120, 225 225, 300 175 S 430 120, 515 200 S 445 330, 505 425', colours[0], width);
  content += path('M 95 430 C 180 360, 250 410, 320 360 S 440 300, 515 330', colours[1 % colours.length], width);
  content += path('M 185 90 C 225 175, 210 250, 250 330 S 315 445, 380 520', colours[2 % colours.length], width, 'stroke-dasharray="12 18"');
  for (let index = 0; index < 4 + options.density; index += 1) {
    const x = 130 + ((index * 79) % 350);
    const y = 130 + ((index * 107) % 350);
    content += circle(x, y, 10 + (index % 2) * 5, colours[index % colours.length], Math.max(2, width - 2), colours[index % colours.length]);
  }
  return svg(content, options, 'Mapa urbano');
}

export const VECTOR_SHAPE_PRESETS: readonly VectorShapePreset[] = [
  { id: 'urban-lines', name: 'Linhas urbanas', description: 'Percursos e linhas para preencher espaço.', category: 'estrutura', render: renderUrbanLines },
  { id: 'skyline', name: 'Edifícios', description: 'Linha de prédios e fachadas.', category: 'estrutura', render: renderSkyline },
  { id: 'city-block', name: 'Quarteirão', description: 'Planta de quarteirão e praça.', category: 'estrutura', render: renderCityBlock },
  { id: 'garden', name: 'Jardim', description: 'Canteiros, caminhos e vegetação.', category: 'natureza', render: renderGarden },
  { id: 'tree', name: 'Árvore', description: 'Árvore gráfica para espaços vazios.', category: 'natureza', render: renderTree },
  { id: 'plant', name: 'Planta', description: 'Planta de interior em vaso.', category: 'natureza', render: renderPlant },
  { id: 'bicycle', name: 'Bicicleta', description: 'Mobilidade suave em traço CGL.', category: 'mobilidade', render: renderBicycle },
  { id: 'car', name: 'Carro', description: 'Automóvel em desenho linear.', category: 'mobilidade', render: renderCar },
  { id: 'tram', name: 'Elétrico', description: 'Referência lisboeta imediata.', category: 'mobilidade', render: renderTram },
  { id: 'streetlamp', name: 'Candeeiro', description: 'Mobiliário urbano e luz.', category: 'sinalética', render: renderStreetlamp },
  { id: 'crosswalk', name: 'Travessia', description: 'Passadeira e sinal de atravessamento.', category: 'sinalética', render: renderCrosswalk },
  { id: 'map', name: 'Mapa', description: 'Rede de ruas e pontos de interesse.', category: 'sinalética', render: renderMap },
] as const;

export function generateVectorShapeSvg(shapeId: VectorShapeId, options: VectorShapeOptions = {}) {
  const preset = VECTOR_SHAPE_PRESETS.find((candidate) => candidate.id === shapeId);
  if (!preset) throw new Error(`Forma CGL desconhecida: ${shapeId}`);
  return preset.render(normalizeOptions(options));
}

export function svgToDataUri(svgMarkup: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
}
