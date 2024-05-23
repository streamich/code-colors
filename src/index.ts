/**
 * We implement our own Web Worker and need to disable Prism's default worker,
 * otherwise it crashes the worker thread.
 */
(globalThis as any).Prism = {
  ...(globalThis as any).Prism,
  disableWorkerMessageHandler: true,
};

export type * from './types';
export * from './highlight';
export * from './CodeColors';

import './window';
import './worker';

import './test';
