/**
 * We implement our own Web Worker and need to disable Prism's default worker,
 * otherwise it crashes the worker thread.
 */
(globalThis as any).Prism = {
  ...(globalThis as any).Prism,
  disableWorkerMessageHandler: true,
};

export type * from './types';
export * from './tokenize';
export * from './CodeColors';
export {
  LANGUAGE_DEPS,
  setComponentsBaseUrl,
  isLanguageLoaded,
  isLanguagePending,
  isLanguageFailed,
  onLanguageLoad,
  onLanguageError,
  loadLang,
  hasLang,
} from './prismutils';

import './window';
import './worker';

import './test';
