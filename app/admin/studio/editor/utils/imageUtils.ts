/**
 * Utilitário para manipulação e processamento de imagens no cliente.
 */

const transparentCache = new Map<string, string>();

/**
 * Remove o fundo branco de uma imagem (DataURL ou URL) em tempo real usando Canvas HTML5.
 * @param imageSrc URL ou DataURL da imagem de origem
 * @param tolerance Tolerância para considerar um pixel como branco (0-50, padrão: 25)
 * @returns Promise com o DataURL PNG de fundo transparente
 */
export async function removeWhiteBackground(
  imageSrc: string,
  tolerance: number = 25
): Promise<string> {
  const cacheKey = `${imageSrc}__tol_${tolerance}`;
  if (transparentCache.has(cacheKey)) {
    return transparentCache.get(cacheKey)!;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(imageSrc);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const threshold = 255 - tolerance;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Se o pixel já for transparente, salta
          if (a === 0) continue;

          // Deteta tons de branco puro e quase branco
          if (r >= threshold && g >= threshold && b >= threshold) {
            // Suavização da borda para não ficar pixelizado
            const minVal = Math.min(r, g, b);
            if (minVal >= 255 - Math.floor(tolerance / 2)) {
              data[i + 3] = 0; // Transparência total
            } else {
              // Transparência gradual (feathering)
              const factor = (255 - minVal) / tolerance;
              data[i + 3] = Math.round(a * factor);
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const resultDataUrl = canvas.toDataURL('image/png');
        transparentCache.set(cacheKey, resultDataUrl);
        resolve(resultDataUrl);
      } catch (err) {
        console.warn('Erro ao processar remoção de fundo branco:', err);
        resolve(imageSrc);
      }
    };

    img.onerror = (err) => {
      console.warn('Falha ao carregar imagem para remoção de fundo:', err);
      resolve(imageSrc);
    };

    img.src = imageSrc;
  });
}
