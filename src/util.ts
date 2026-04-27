export const isBrowserMainThread = typeof window !== 'undefined';
export const isBrowserWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;

export const loadScript = async (src: string): Promise<void> => {
  if (isBrowserWorker) {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`SCRIPT_LOAD_ERROR: ${res.status} ${src}`);
    const text = await res.text();
    const blobUrl = URL.createObjectURL(new Blob([text], {type: 'text/javascript'}));
    try {
      importScripts(blobUrl);
    } finally {
      URL.revokeObjectURL(blobUrl);
    }
    return;
  }
  return new Promise<void>((resolve, reject) => {
    try {
      if (isBrowserMainThread) {
        const script = document.createElement('script');
        let settled = false;
        const cleanup = (): void => {
          settled = true;
          window.removeEventListener('error', onExecError);
        };
        const onExecError = (event: ErrorEvent): void => {
          if (settled) return;
          if (event.filename !== script.src) return;
          cleanup();
          event.preventDefault();
          reject(event.error ?? new Error(event.message || 'SCRIPT_EXEC_ERROR'));
        };
        window.addEventListener('error', onExecError);
        script.onload = () => {
          if (!settled) {
            cleanup();
            resolve();
          }
        };
        script.onerror = (a, b, c, d, error?: Error) => {
          if (!settled) {
            cleanup();
            reject(error ?? new Error('SCRIPT_LOAD_ERROR'));
          }
        };
        script.src = src;
        document.head.appendChild(script);
      } else throw new Error('NOT_BROWSER');
    } catch (error) {
      reject(error);
    }
  });
};

