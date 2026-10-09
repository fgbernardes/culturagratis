import React, { forwardRef, useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import type { TagShape, PhotoFilter } from '../types';
import { getColoredSvgUri } from '../utils/colorExtractor';
import { resolveAsset } from '../utils/assetStore';
import { removeWhiteBackground } from '../utils/imageUtils';

export const Canvas = forwardRef<HTMLDivElement>((_, ref) => {
  const {
    canvasSettings,
    brandLogo,
    elements,
    selectedElementId,
    setSelectedElementId,
    updateElement,
    slides,
    activeSlideIndex,
  } = useStore();
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [processedLogoSrc, setProcessedLogoSrc] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (brandLogo.src && brandLogo.removeWhiteBg) {
      removeWhiteBackground(resolveAsset(brandLogo.src)).then((transparentUrl) => {
        if (isMounted) {
          setProcessedLogoSrc(transparentUrl);
        }
      });
    } else {
      setProcessedLogoSrc(resolveAsset(brandLogo.src));
    }
    return () => {
      isMounted = false;
    };
  }, [brandLogo.src, brandLogo.removeWhiteBg]);

  const activePhoto = slides[activeSlideIndex]?.photo;

  const isLight = (hex: string) => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  };

  const textureBlendMode = isLight(canvasSettings.backgroundColor) ? 'multiply' : 'screen';

  const getTagShapeStyles = (shape: TagShape = 'rounded'): React.CSSProperties => {
    switch (shape) {
      case 'pill':
        return {
          borderRadius: '9999px',
          padding: '6px 20px',
          clipPath: undefined,
        };
      case 'ticket':
        return {
          borderRadius: '0px',
          padding: '8px 24px',
          clipPath:
            'polygon(0% 0%, 100% 0%, 100% calc(50% - 8px), calc(100% - 10px) 50%, 100% calc(50% + 8px), 100% 100%, 0% 100%, 0% calc(50% + 8px), 10px 50%, 0% calc(50% - 8px))',
        };
      case 'stamp':
        return {
          borderRadius: '0px',
          padding: '10px 22px',
          clipPath:
            'polygon(0% 0%, 5% 4px, 10% 0%, 15% 4px, 20% 0%, 25% 4px, 30% 0%, 35% 4px, 40% 0%, 45% 4px, 50% 0%, 55% 4px, 60% 0%, 65% 4px, 70% 0%, 75% 4px, 80% 0%, 85% 4px, 90% 0%, 95% 4px, 100% 0%, 98% 15%, 100% 30%, 98% 45%, 100% 60%, 98% 75%, 100% 90%, 98% 100%, 95% 96%, 90% 100%, 85% 96%, 80% 100%, 75% 96%, 70% 100%, 65% 96%, 60% 100%, 55% 96%, 50% 100%, 45% 96%, 40% 100%, 35% 96%, 30% 100%, 25% 96%, 20% 100%, 15% 96%, 10% 100%, 5% 96%, 0% 100%, 2% 85%, 0% 70%, 2% 55%, 0% 40%, 2% 25%, 0% 10%)',
        };
      case 'glass':
        return {
          borderRadius: '16px',
          padding: '16px 20px',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          clipPath: undefined,
          maxWidth: '90%',
          width: 'fit-content',
          height: 'fit-content',
        };
      case 'rounded':
      default:
        return {
          borderRadius: '6px',
          padding: '8px 16px',
          clipPath: undefined,
        };
    }
  };

  const handleDrag = (id: string, e: React.MouseEvent | React.PointerEvent) => {
    if (editingElementId === id) return;
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const currentEl = elements.find((el) => el.id === id);
    if (!currentEl) return;

    const initialX = currentEl.x;
    const initialY = currentEl.y;

    const onPointerMove = (moveEvent: PointerEvent | MouseEvent) => {
      const deltaX = (moveEvent.clientX - startX) / canvasSettings.zoom;
      const deltaY = (moveEvent.clientY - startY) / canvasSettings.zoom;
      updateElement(id, {
        x: Math.round(initialX + deltaX),
        y: Math.round(initialY + deltaY),
      });
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
  };

  const handleResize = (
    id: string,
    corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
    e: React.PointerEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const currentEl = elements.find((el) => el.id === id);
    if (!currentEl) return;

    const initialWidth = currentEl.width || 250;
    const initialX = currentEl.x;
    const initialY = currentEl.y;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = (moveEvent.clientX - startX) / canvasSettings.zoom;
      
      let newWidth = initialWidth;
      let newX = initialX;
      let newY = initialY;

      if (corner === 'bottom-right') {
        newWidth = Math.max(50, Math.min(2500, Math.round(initialWidth + deltaX)));
      } else if (corner === 'bottom-left') {
        const diff = -deltaX;
        newWidth = Math.max(50, Math.min(2500, Math.round(initialWidth + diff)));
        newX = Math.round(initialX - (newWidth - initialWidth));
      } else if (corner === 'top-right') {
        newWidth = Math.max(50, Math.min(2500, Math.round(initialWidth + deltaX)));
        const heightDiff = (newWidth - initialWidth);
        newY = Math.round(initialY - heightDiff);
      } else if (corner === 'top-left') {
        const diff = -deltaX;
        newWidth = Math.max(50, Math.min(2500, Math.round(initialWidth + diff)));
        newX = Math.round(initialX - (newWidth - initialWidth));
        newY = Math.round(initialY - (newWidth - initialWidth));
      }

      updateElement(id, {
        width: newWidth,
        ...(corner === 'bottom-left' || corner === 'top-left' ? { x: newX } : {}),
        ...(corner === 'top-right' || corner === 'top-left' ? { y: newY } : {}),
      });
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const getPhotoFilterStyle = (filter?: PhotoFilter): string | undefined => {
    switch (filter) {
      case 'bw':
        return 'grayscale(100%) contrast(120%)';
      case 'vintage':
        return 'sepia(30%) saturate(140%) contrast(105%)';
      case 'night':
        return 'brightness(80%) contrast(115%) saturate(90%)';
      case 'none':
      default:
        return undefined;
    }
  };

  const getLogoStyle = (): React.CSSProperties => {
    const { position, margin, size, opacity, backgroundHighlight, blendMode, logoColorMode, logoShape } = brandLogo;
    
    // Filtro de cor monocromático
    let colorFilter = '';
    if (logoColorMode === 'white') {
      colorFilter = 'brightness(0) invert(1)';
    } else if (logoColorMode === 'black') {
      colorFilter = 'brightness(0)';
    }

    const isCircle = logoShape !== 'original';

    // Configurações de destaque e fundo
    let highlightStyles: React.CSSProperties = {
      backgroundColor: 'transparent',
      mixBlendMode: blendMode && blendMode !== 'multiply' ? blendMode : 'normal',
      filter: colorFilter
        ? `${colorFilter} drop-shadow(0 4px 14px rgba(0,0,0,0.75))`
        : 'drop-shadow(0 4px 14px rgba(0,0,0,0.75))',
    };

    const circleHighlights: Record<string, { color: string; border: string }> = {
      'white-circle': { color: '#FFFDF8', border: 'rgba(255,255,255,0.85)' },
      'orange-circle': { color: '#FE7D02', border: 'rgba(255,190,110,0.9)' },
      'yellow-circle': { color: '#FFC107', border: 'rgba(255,238,156,0.9)' },
      'tejo-circle': { color: '#00838F', border: 'rgba(119,218,225,0.8)' },
      'charcoal-circle': { color: '#1A1A1A', border: 'rgba(255,255,255,0.28)' },
    };
    const circleHighlight = circleHighlights[backgroundHighlight || ''];

    if (circleHighlight) {
      highlightStyles = {
        backgroundColor: circleHighlight.color,
        borderRadius: '9999px',
        padding: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.2)',
        border: `2px solid ${circleHighlight.border}`,
        mixBlendMode: 'normal',
        filter: colorFilter || undefined,
      };
    } else if (backgroundHighlight === 'dark-pill') {
      highlightStyles = {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        borderRadius: '9999px',
        padding: '8px 16px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 6px 20px rgba(0,0,0,0.45)',
        mixBlendMode: 'normal',
        filter: colorFilter || undefined,
      };
    }

    const base: React.CSSProperties = {
      position: 'absolute',
      width: `${size}px`,
      height: isCircle ? `${size}px` : 'auto',
      opacity: opacity !== undefined ? opacity : 1,
      zIndex: 40,
      pointerEvents: 'none',
      overflow: isCircle ? 'hidden' : 'visible',
      borderRadius: isCircle ? '50%' : '0px',
      ...highlightStyles,
    };

    const is916 = canvasSettings.aspectRatio === '9:16';
    const topSafe = is916 ? Math.max(margin || 40, 180) : (margin || 40);
    const bottomSafe = is916 ? Math.max(margin || 40, 260) : (margin || 40);
    const rightSafe = is916 ? Math.max(margin || 40, 100) : (margin || 40);
    const leftSafe = margin || 40;

    switch (position) {
      case 'top-left':
        return { ...base, top: `${topSafe}px`, left: `${leftSafe}px` };
      case 'top-right':
        return { ...base, top: `${topSafe}px`, right: `${rightSafe}px` };
      case 'bottom-left':
        return { ...base, bottom: `${bottomSafe}px`, left: `${leftSafe}px` };
      case 'bottom-right':
        return { ...base, bottom: `${bottomSafe}px`, right: `${rightSafe}px` };
      case 'center':
        return { ...base, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
      default:
        return base;
    }
  };

  const scaledWidth = Math.round(canvasSettings.width * canvasSettings.zoom);
  const scaledHeight = Math.round(canvasSettings.height * canvasSettings.zoom);

  return (
    <div 
      className="flex-1 bg-zinc-950 overflow-auto h-full w-full relative select-none flex"
      onClick={() => {
        setSelectedElementId(null);
        setEditingElementId(null);
      }}
    >
      <div className="min-w-full min-h-full p-16 md:p-20 flex items-center justify-center m-auto">
        <div
          style={{
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <div
            ref={ref}
            style={{
              width: `${canvasSettings.width}px`,
              height: `${canvasSettings.height}px`,
              position: 'absolute',
              top: 0,
              left: 0,
              transform: `scale(${canvasSettings.zoom})`,
              transformOrigin: 'top left',
              backgroundColor: canvasSettings.backgroundColor,
              backgroundImage: canvasSettings.backgroundImage
                ? `url(${resolveAsset(canvasSettings.backgroundImage)})`
                : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: canvasSettings.textureType === 'noise' ? 'url(#cgl-noise)' : undefined,
              isolation: 'isolate',
            }}
            className="shadow-2xl select-none overflow-hidden"
          >
        {slides[activeSlideIndex]?.pipelineEvent && (() => {
          const ratio=canvasSettings.aspectRatio;
          const tall=ratio==='9:16',wide=ratio==='16:9',square=ratio==='1:1';
          const top=tall?315:wide?170:square?145:155;
          const height=tall?700:wide?370:square?375:510;
          return <div aria-hidden="true" style={{position:'absolute',inset:0,zIndex:10,pointerEvents:'none'}}>
            <div style={{position:'absolute',left:0,top,width:'100%',height,background:'#FE7D02',clipPath:'polygon(0 0, 100% 0, 100% 88%, 0 100%)'}}/>
            <div style={{position:'absolute',right:wide?100:65,top:top+height-18,width:wide?320:180,height:wide?320:180,border:'18px solid #00838F',borderRadius:'50%',opacity:.9}}/>
            <div style={{position:'absolute',left:wide?120:80,top:top+height+25,width:wide?430:250,height:12,background:'#FFC107'}}/>
          </div>;
        })()}
        {/* Filtro SVG de Ruído CGL */}
        {canvasSettings.textureType === 'noise' && (
          <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none', zIndex: 1 }} width="0" height="0">
            <defs>
              <filter id="cgl-noise">
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" result="noise" />
                <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.15 0" result="coloredNoise" />
                <feMerge>
                  <feMergeNode in="SourceGraphic" />
                  <feMergeNode in="coloredNoise" />
                </feMerge>
              </filter>
            </defs>
          </svg>
        )}

        {/* Textura de Calçada Portuguesa */}
        {canvasSettings.textureType === 'calcada' && (
          <div 
            className="absolute inset-0 pointer-events-none z-1"
            style={{
              backgroundImage: 'url(/textures/calcada.jpg)',
              backgroundRepeat: 'repeat',
              backgroundSize: '400px',
              mixBlendMode: textureBlendMode,
              opacity: canvasSettings.textureOpacity,
            }}
          />
        )}

        {/* Camada Dedicada da Fotografia Principal (zIndex: 5) */}
        {activePhoto && activePhoto.src && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 5,
              pointerEvents: 'none',
              opacity: activePhoto.opacity !== undefined ? activePhoto.opacity : 1,
              transform: `translate(${activePhoto.x || 0}px, ${activePhoto.y || 0}px) scale(${activePhoto.scale || 1})`,
              transformOrigin: 'center center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={resolveAsset(activePhoto.src)}
              alt="Fotografia Principal"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                filter: getPhotoFilterStyle(activePhoto.filter),
              }}
              draggable={false}
            />
          </div>
        )}

        {/* Camada de Degradé e Sombras para Legibilidade (zIndex: 6) */}
        {activePhoto && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex: 6,
              background: [
                (activePhoto.topGradient ?? 0.6) > 0
                  ? `linear-gradient(to bottom, rgba(0,0,0,${activePhoto.topGradient ?? 0.6}) 0%, transparent 35%)`
                  : null,
                (activePhoto.bottomGradient ?? 0.8) > 0
                  ? `linear-gradient(to top, rgba(0,0,0,${activePhoto.bottomGradient ?? 0.8}) 0%, transparent 40%)`
                  : null,
                (activePhoto.vignette ?? 0) > 0
                  ? `radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,${activePhoto.vignette}) 100%)`
                  : null,
              ]
                .filter(Boolean)
                .join(', ') || 'none',
            }}
          />
        )}

        {/* Guias visuais de Zona Segura por Plataforma */}
        {canvasSettings.showSafeZones && (
          <div
            data-export-ignore
            className="absolute inset-0 pointer-events-none z-50 overflow-hidden select-none"
          >
            {canvasSettings.aspectRatio === '9:16' ? (
              <>
                {/* Topo UI (160px) - Header / Utilizador / Câmara */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '160px',
                    borderBottom: '1px dashed rgba(239, 68, 68, 0.6)',
                  }}
                >
                  <span className="absolute bottom-2 left-4 bg-red-950/80 border border-red-500/40 text-red-300 text-[11px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider backdrop-blur-xs">
                    Topo UI: Câmara & Header (160px)
                  </span>
                </div>

                {/* Base UI (240px) - Legendas / Nome da Música / CTA */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '240px',
                    borderTop: '1px dashed rgba(239, 68, 68, 0.6)',
                  }}
                >
                  <span className="absolute top-2 left-4 bg-red-950/80 border border-red-500/40 text-red-300 text-[11px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider backdrop-blur-xs">
                    Base UI: Legenda & Áudio (240px)
                  </span>
                </div>

                {/* Lateral Direita (90px) - Botões Like / Comentários / Partilhas */}
                <div
                  style={{
                    position: 'absolute',
                    top: '160px',
                    bottom: '240px',
                    right: 0,
                    width: '90px',
                    borderLeft: '1px dashed rgba(239, 68, 68, 0.6)',
                  }}
                >
                  <span className="absolute top-4 right-2 bg-red-950/80 border border-red-500/40 text-red-300 text-[9px] font-bold px-1.5 py-1 rounded shadow-sm uppercase text-center [writing-mode:vertical-lr] backdrop-blur-xs">
                    Botões Like (90px)
                  </span>
                </div>

                {/* Moldura Central Segura */}
                <div
                  style={{
                    position: 'absolute',
                    top: '160px',
                    bottom: '240px',
                    left: '40px',
                    right: '100px',
                    border: '1px dashed rgba(16, 185, 129, 0.6)',
                    borderRadius: '8px',
                  }}
                >
                  <span className="absolute top-2.5 left-2.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider backdrop-blur-xs">
                    ✅ Zona Segura TikTok / Reels / Stories (9:16)
                  </span>
                </div>
              </>
            ) : canvasSettings.aspectRatio === '4:5' ? (
              <>
                {/* Linhas de corte do Feed 1:1 Instagram (135px topo e base) */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '135px',
                    borderBottom: '1px dashed rgba(245, 158, 11, 0.6)',
                  }}
                >
                  <span className="absolute bottom-2 left-4 bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase backdrop-blur-xs">
                    Recorte Grid Perfil 1:1 (135px)
                  </span>
                </div>

                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '135px',
                    borderTop: '1px dashed rgba(245, 158, 11, 0.6)',
                  }}
                >
                  <span className="absolute top-2 left-4 bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase backdrop-blur-xs">
                    Recorte Grid Perfil 1:1 (135px)
                  </span>
                </div>

                <div
                  style={{
                    position: 'absolute',
                    top: '135px',
                    bottom: '135px',
                    left: '40px',
                    right: '40px',
                    border: '1px dashed rgba(16, 185, 129, 0.6)',
                    borderRadius: '8px',
                  }}
                >
                  <span className="absolute top-2.5 left-2.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider backdrop-blur-xs">
                    ✅ Área Segura Instagram Feed (4:5)
                  </span>
                </div>
              </>
            ) : (
              <div
                style={{
                  position: 'absolute',
                  inset: '40px',
                  border: '1px dashed rgba(16, 185, 129, 0.6)',
                  borderRadius: '8px',
                }}
              >
                <span className="absolute top-2.5 left-2.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider backdrop-blur-xs">
                  ✅ Área Segura ({canvasSettings.aspectRatio})
                </span>
              </div>
            )}
          </div>
        )}

        {/* Barra de Progresso Automática do Carrossel */}
        {canvasSettings.showProgressBar && (
          <div
            data-testid="carousel-progress-bar"
            style={{
              position: 'absolute',
              top: '16px',
              left: '40px',
              right: '40px',
              height: '4px',
              zIndex: 45,
              display: 'flex',
              gap: '8px',
              pointerEvents: 'none',
            }}
          >
            {slides.map((_, idx) => (
              <div
                key={idx}
                data-testid="carousel-progress-segment"
                style={{
                  flex: 1,
                  height: '4px',
                  borderRadius: '9999px',
                  backgroundColor:
                    idx <= activeSlideIndex
                      ? (slides[activeSlideIndex]?.photo?.extractedColors?.vibrant || '#FE7D02')
                      : 'rgba(255, 255, 255, 0.25)',
                  boxShadow: idx <= activeSlideIndex ? '0 1px 4px rgba(0,0,0,0.6)' : undefined,
                  transition: 'background-color 0.2s ease',
                }}
              />
            ))}
          </div>
        )}

        {/* Marca d'Água / Logótipo */}
        {brandLogo.src && brandLogo.visible && (
          <div
            style={{
              ...getLogoStyle(),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={processedLogoSrc || resolveAsset(brandLogo.src)}
              alt="Logótipo CGL"
              style={{
                width: '100%',
                height: brandLogo.logoShape === 'original' ? 'auto' : '100%',
                objectFit: brandLogo.logoShape === 'original' ? 'contain' : 'cover',
                borderRadius: brandLogo.logoShape === 'original' ? '0px' : '50%',
                display: 'block',
              }}
              className="select-none"
              draggable={false}
            />
          </div>
        )}

        {/* Elementos de Texto e Imagem */}
        {elements.map((el) => {
          if (el.type === 'image') {
            const isImageSelected = selectedElementId === el.id;

            return (
              <div
                key={el.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedElementId(el.id);
                  setEditingElementId(null);
                }}
                onPointerDown={(e) => handleDrag(el.id, e)}
                style={{
                  position: 'absolute',
                  left: `${el.x}px`,
                  top: `${el.y}px`,
                  width: el.width ? `${el.width}px` : '250px',
                  height: 'auto',
                  transform: `rotate(${el.rotation || 0}deg)`,
                  zIndex: 25,
                  opacity: el.opacity !== undefined ? el.opacity : 1,
                  touchAction: 'none',
                }}
                className={`cursor-move inline-block p-1 border-2 transition-colors relative ${
                  isImageSelected ? 'border-indigo-500 rounded ring-2 ring-indigo-500/30' : 'border-transparent hover:border-zinc-700/60'
                }`}
              >
                <img
                  src={el.color && el.src ? getColoredSvgUri(resolveAsset(el.src), el.color) : resolveAsset(el.src)}
                  alt="Elemento Visual"
                  style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'none' }}
                  draggable={false}
                />

                {/* 4 Alças de Redimensionamento nos Cantos (12x12px brancas com rebordo escuro) */}
                {isImageSelected && (
                  <>
                    <div
                      data-export-ignore
                      onPointerDown={(e) => handleResize(el.id, 'top-left', e)}
                      className="w-3 h-3 bg-white border-2 border-zinc-950 rounded-xs shadow-md absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize z-40 hover:scale-125 transition-transform"
                      title="Redimensionar"
                    />
                    <div
                      data-export-ignore
                      onPointerDown={(e) => handleResize(el.id, 'top-right', e)}
                      className="w-3 h-3 bg-white border-2 border-zinc-950 rounded-xs shadow-md absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize z-40 hover:scale-125 transition-transform"
                      title="Redimensionar"
                    />
                    <div
                      data-export-ignore
                      onPointerDown={(e) => handleResize(el.id, 'bottom-left', e)}
                      className="w-3 h-3 bg-white border-2 border-zinc-950 rounded-xs shadow-md absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize z-40 hover:scale-125 transition-transform"
                      title="Redimensionar"
                    />
                    <div
                      data-export-ignore
                      onPointerDown={(e) => handleResize(el.id, 'bottom-right', e)}
                      className="w-3 h-3 bg-white border-2 border-zinc-950 rounded-xs shadow-md absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize z-40 hover:scale-125 transition-transform"
                      title="Redimensionar"
                    />
                  </>
                )}
              </div>
            );
          }

          const isSelected = selectedElementId === el.id;
          const isEditing = editingElementId === el.id;
          const bgStyle =
            el.backgroundStyle ||
            (el.isGlass || el.tagShape === 'glass' ? 'glass' : el.hasBadge ? 'solid' : 'none');
          const isGlass = bgStyle === 'glass';
          const hasBackground = bgStyle !== 'none';
          const tagStyles = hasBackground ? getTagShapeStyles(isGlass ? 'glass' : el.tagShape) : {};

          return (
            <div
              key={el.id}
              data-studio-element={el.id}
              onClick={(e) => {
                e.stopPropagation();
                if (selectedElementId === el.id) {
                  setEditingElementId(el.id);
                } else {
                  setSelectedElementId(el.id);
                }
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setSelectedElementId(el.id);
                setEditingElementId(el.id);
              }}
              onMouseDown={(e) => {
                if (isEditing) {
                  e.stopPropagation();
                  return;
                }
                handleDrag(el.id, e);
              }}
              style={{
                position: 'absolute',
                left: `${el.x}px`,
                top: `${el.y}px`,
                width: el.width ? `${el.width}px` : (hasBackground ? 'fit-content' : undefined),
                maxWidth: '90%',
                height: 'fit-content',
                color: el.color || '#ffffff',
                fontSize: el.fontSize ? `${el.fontSize}px` : '36px',
                fontFamily: el.fontFamily || 'system-ui, sans-serif',
                opacity: el.opacity ?? 1,
                textAlign: el.textAlign || 'left',
                zIndex: isEditing ? 50 : 30,
                textShadow: el.hasShadow ? '0 4px 14px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.7)' : undefined,
                backgroundColor: isGlass
                  ? (el.badgeColor || 'rgba(0, 0, 0, 0.45)')
                  : (hasBackground ? (el.badgeColor || '#1A1A1A') : undefined),
                display: hasBackground ? 'inline-block' : undefined,
                fontWeight: el.fontWeight || 700,
                fontStyle: el.fontStyle || 'normal',
                textTransform: el.textTransform || 'none',
                ...tagStyles,
              }}
              title={isEditing ? 'A editar texto... (Pressione ESC ou clique fora para terminar)' : 'Clique para selecionar / Duplo clique para editar'}
              className={`inline-block p-2 border-2 transition-colors ${
                isEditing
                  ? 'border-cgl-orange rounded ring-2 ring-cgl-orange/50 cursor-text'
                  : isSelected
                  ? 'border-indigo-500 rounded ring-2 ring-indigo-500/30 cursor-move'
                  : 'border-transparent cursor-move hover:border-zinc-700/60'
              }`}
            >
              {isEditing ? (
                <textarea
                  autoFocus
                  value={el.content || ''}
                  onChange={(e) => updateElement(el.id, { content: e.target.value })}
                  onBlur={() => setEditingElementId(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setEditingElementId(null);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  style={{
                    width: el.width ? `${el.width}px` : '100%',
                    minWidth: el.fontSize ? `${Math.max(260, (el.content || '').length * (el.fontSize * 0.35))}px` : '260px',
                    color: el.color || '#ffffff',
                    fontSize: el.fontSize ? `${el.fontSize}px` : '36px',
                    fontFamily: el.fontFamily || 'system-ui, sans-serif',
                    textAlign: el.textAlign || 'left',
                    fontWeight: el.fontWeight || 700,
                    fontStyle: el.fontStyle || 'normal',
                    textTransform: el.textTransform || 'none',
                    textShadow: el.hasShadow ? '0 4px 14px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.7)' : undefined,
                    lineHeight: 1.15,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    padding: 0,
                    margin: 0,
                    overflow: 'hidden',
                    display: 'block',
                  }}
                  rows={Math.max(1, (el.content || '').split('\n').length)}
                />
              ) : el.isCalendarBadge ? (
                <div
                  style={{
                    width: el.width ? `${el.width}px` : '105px',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
                    border: '2px solid rgba(255, 255, 255, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  {/* Cabeçalho Colorido do Mês */}
                  <div
                    style={{
                      width: '100%',
                      backgroundColor: el.badgeColor || '#FE7D02',
                      color: '#FFFFFF',
                      textAlign: 'center',
                      fontSize: el.fontSize ? `${Math.round(el.fontSize * 0.42)}px` : '15px',
                      fontWeight: 800,
                      letterSpacing: '0.12em',
                      padding: '4px 2px',
                      textTransform: 'uppercase',
                      fontFamily: '"Inter", sans-serif',
                    }}
                  >
                    {(el.content || 'AGO\n19').split('\n')[0] || 'AGO'}
                  </div>
                  {/* Corpo Branco do Dia */}
                  <div
                    style={{
                      width: '100%',
                      backgroundColor: '#FFFFFF',
                      color: '#1A1A1A',
                      textAlign: 'center',
                      fontSize: el.fontSize ? `${el.fontSize}px` : '36px',
                      fontWeight: 900,
                      fontFamily: '"Bricolage Grotesque", sans-serif',
                      padding: '4px 2px 8px 2px',
                      lineHeight: 1,
                      letterSpacing: '-0.03em',
                    }}
                  >
                    {(el.content || 'AGO\n19').split('\n').slice(1).join('\n') || '19'}
                  </div>
                </div>
              ) : (
                <span className="leading-tight whitespace-pre-wrap block">
                  {el.content || 'Novo Texto'}
                </span>
              )}
            </div>
          );
        })}
          </div>
        </div>
      </div>
    </div>
  );
});

Canvas.displayName = 'Canvas';
