export const isBrowserMainThread = typeof window !== 'undefined';
export const isBrowserWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;

export const loadScript = (src: string): Promise<void> =>
  new Promise<void>((resolve, reject) => {
    try {
      if (isBrowserWorker) {
        importScripts(src);
        resolve();
      } else if (isBrowserMainThread) {
        const script = document.createElement('script');
        script.onload = () => resolve();
        script.onerror = (a, b, c, d, error?: Error) => reject(error ?? new Error('SCRIPT_LOAD_ERROR'));
        script.src = src;
        document.head.appendChild(script);
      } else throw new Error('NOT_BROWSER');
    } catch (error) {
      reject(error);
    }
  });
