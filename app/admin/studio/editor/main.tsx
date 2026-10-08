import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import "@fontsource/bricolage-grotesque/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/700.css";
import { hydrateAssets } from './utils/assetStore';
import { migrateLegacyDataUrls, pruneOrphanAssets } from './utils/assetMigration';

/**
 * As imagens têm de estar em memória ANTES do primeiro render.
 *
 * O `resolveAsset` é síncrono para o React poder pedir o `src` no primeiro
 * render sem esperar por uma promessa. Isso só funciona se os object URLs já
 * estiverem no cache — daí carregarmos o IndexedDB antes de montar a app.
 * Se falhar, montamos na mesma: um editor sem as fotografias anteriores é
 * mau, um ecrã em branco é pior.
 */
const boot = async () => {
  try {
    await hydrateAssets();
    await migrateLegacyDataUrls();
  } catch (err) {
    console.error('Falha ao preparar as imagens guardadas:', err);
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );

  // Limpeza das imagens que já nenhum projeto usa. Depois do render, porque
  // não é urgente e não deve atrasar o arranque.
  void pruneOrphanAssets();
};

void boot();
