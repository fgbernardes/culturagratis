import type { ExtractedColors } from '../types';

/**
 * Converte valores RGB para formato Hexadecimal
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Calcula a saturação e luminosidade (HSL) de um valor RGB
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s, l };
}

/**
 * Extrai a cor dominante e a cor de contraste vibrante de uma imagem utilizando um Canvas em memória.
 */
export async function extractColorsFromImage(imageSrc: string): Promise<ExtractedColors> {
  return new Promise((resolve) => {
    // Fallback padrão seguro (Cores CGL)
    const fallbackColors: ExtractedColors = {
      dominant: '#1A1A1A',
      vibrant: '#FE7D02',
      palette: ['#FE7D02', '#FFC107', '#00838F', '#1A1A1A'],
    };

    if (typeof window === 'undefined' || !imageSrc) {
      resolve(fallbackColors);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(fallbackColors);
          return;
        }

        // Amostragem em resolução reduzida para alta performance (80x80 pixels)
        const size = 80;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const imgData = ctx.getImageData(0, 0, size, size).data;
        const colorBuckets: Map<string, { r: number; g: number; b: number; count: number; s: number; l: number }> = new Map();

        let totalR = 0;
        let totalG = 0;
        let totalB = 0;
        let validPixels = 0;

        for (let i = 0; i < imgData.length; i += 4) {
          const a = imgData[i + 3];
          if (a < 128) continue; // Ignorar pixels transparentes

          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];

          totalR += r;
          totalG += g;
          totalB += b;
          validPixels++;

          const { s, l } = rgbToHsl(r, g, b);

          // Agrupar em buckets quantizados (passo de 24)
          const quantR = Math.round(r / 24) * 24;
          const quantG = Math.round(g / 24) * 24;
          const quantB = Math.round(b / 24) * 24;
          const key = `${quantR},${quantG},${quantB}`;

          const existing = colorBuckets.get(key);
          if (existing) {
            existing.count++;
          } else {
            colorBuckets.set(key, { r, g, b, count: 1, s, l });
          }
        }

        if (validPixels === 0) {
          resolve(fallbackColors);
          return;
        }

        // 1. Cor Dominante (Média Geral)
        const dominant = rgbToHex(totalR / validPixels, totalG / validPixels, totalB / validPixels);

        // 2. Cor Vibrante (com maior pontuação de saturação e equilíbrio de luminosidade)
        const sortedBuckets = Array.from(colorBuckets.values()).sort((a, b) => {
          // Pontuação valoriza saturação média-alta (saturada e legível)
          const scoreA = a.count * (a.s * 2.5) * (1 - Math.abs(a.l - 0.5));
          const scoreB = b.count * (b.s * 2.5) * (1 - Math.abs(b.l - 0.5));
          return scoreB - scoreA;
        });

        // Filtrar buckets muito escuros ou desbotados
        const vibrantCandidates = sortedBuckets.filter((b) => b.s > 0.25 && b.l > 0.25 && b.l < 0.85);

        let vibrant = fallbackColors.vibrant;
        if (vibrantCandidates.length > 0) {
          const best = vibrantCandidates[0];
          vibrant = rgbToHex(best.r, best.g, best.b);
        } else if (sortedBuckets.length > 0) {
          const best = sortedBuckets[0];
          vibrant = rgbToHex(best.r, best.g, best.b);
        }

        // 3. Paleta de Top 4 Cores
        const palette = sortedBuckets.slice(0, 4).map((b) => rgbToHex(b.r, b.g, b.b));
        if (!palette.includes(vibrant)) {
          palette.unshift(vibrant);
        }

        resolve({
          dominant,
          vibrant,
          palette: palette.slice(0, 4),
        });
      } catch (err) {
        console.warn('Erro ao processar cores da imagem:', err);
        resolve(fallbackColors);
      }
    };

    img.onerror = () => {
      resolve(fallbackColors);
    };

    img.src = imageSrc;
  });
}

/**
 * Aplica uma cor dinâmica aos preenchimentos e contornos de destaque de um SVG em formato Data URI
 */
export function getColoredSvgUri(src: string, color?: string): string {
  if (!color || !src.startsWith('data:image/svg+xml')) return src;
  try {
    const isBase64 = src.includes(';base64,');
    let svg = '';
    if (isBase64) {
      const base64Part = src.split(';base64,')[1];
      svg = decodeURIComponent(escape(atob(base64Part)));
    } else {
      svg = decodeURIComponent(src.split(',')[1]);
    }

    // Substitui as cores de preenchimento/contorno de destaque
    const updatedSvg = svg
      .replace(/fill="(#FFC107|#FE7D02|#00838F|#DC2626|#FF6B00|#FFCC00|currentColor)"/gi, `fill="${color}"`)
      .replace(/stroke="(#FFC107|#FE7D02|#00838F|#DC2626|#FF6B00|#FFCC00)"/gi, `stroke="${color}"`);

    const newBase64 = btoa(unescape(encodeURIComponent(updatedSvg.trim())));
    return `data:image/svg+xml;base64,${newBase64}`;
  } catch {
    return src;
  }
}

