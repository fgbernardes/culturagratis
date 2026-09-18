/**
 * Armazenamento do editor com reporte honesto de falhas.
 *
 * O `localStorage` falha em silêncio em duas situações comuns neste editor:
 * quando a quota (~5 MB) é excedida, e quando o browser bloqueia o acesso
 * (navegação privada, cookies de terceiros desligados). Sem este envelope, o
 * `persist` do Zustand engole o erro e o utilizador continua a trabalhar
 * convencido de que está tudo guardado.
 */

export type StorageStatus = { ok: true } | { ok: false; message: string };

type Listener = (status: StorageStatus) => void;

let listener: Listener | null = null;

/** Regista quem é notificado do resultado de cada escrita. */
export const onStorageStatus = (next: Listener | null): void => {
  listener = next;
};

const isQuotaError = (err: unknown): boolean =>
  err instanceof DOMException &&
  (err.name === 'QuotaExceededError' ||
    err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    err.code === 22);

const describe = (err: unknown): string => {
  if (isQuotaError(err)) {
    return 'O trabalho deixou de ser guardado automaticamente: o armazenamento do browser está cheio. Exporta o que tens agora e remove as fotografias mais pesadas do projeto.';
  }
  const detail = err instanceof Error ? err.message : String(err);
  return `O trabalho deixou de ser guardado automaticamente: ${detail}`;
};

export const editorStorage = {
  getItem: (name: string): string | null => {
    try {
      return localStorage.getItem(name);
    } catch {
      // Sem acesso a localStorage: arrancamos com o estado por defeito.
      return null;
    }
  },

  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
      listener?.({ ok: true });
    } catch (err) {
      console.error('Falha ao guardar o estado do editor:', err);
      listener?.({ ok: false, message: describe(err) });
    }
  },

  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch {
      // Nada a fazer: já não existe ou não temos acesso.
    }
  },
};
