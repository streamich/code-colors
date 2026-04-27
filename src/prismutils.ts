import * as prism from 'prismjs';
import {loadScript} from './util';

/** Direct grammar dependencies derived from prismjs/components.json. */
export const LANGUAGE_DEPS: Readonly<Record<string, string[]>> = {
  javascript: ['clike'],
  actionscript: ['javascript'],
  apex: ['clike', 'sql'],
  arduino: ['cpp'],
  aspnet: ['markup', 'csharp'],
  birb: ['clike'],
  bison: ['c'],
  c: ['clike'],
  csharp: ['clike'],
  cpp: ['c'],
  cfscript: ['clike'],
  chaiscript: ['clike', 'cpp'],
  cilkc: ['c'],
  cilkcpp: ['cpp'],
  coffeescript: ['javascript'],
  crystal: ['ruby'],
  'css-extras': ['css'],
  d: ['clike'],
  dart: ['clike'],
  django: ['markup-templating'],
  ejs: ['javascript', 'markup-templating'],
  etlua: ['lua', 'markup-templating'],
  erb: ['ruby', 'markup-templating'],
  fsharp: ['clike'],
  'firestore-security-rules': ['clike'],
  flow: ['javascript'],
  ftl: ['markup-templating'],
  gml: ['clike'],
  glsl: ['c'],
  go: ['clike'],
  gradle: ['clike'],
  groovy: ['clike'],
  haml: ['ruby'],
  handlebars: ['markup-templating'],
  haxe: ['clike'],
  hlsl: ['c'],
  idris: ['haskell'],
  java: ['clike'],
  javadoc: ['markup', 'java', 'javadoclike'],
  jolie: ['clike'],
  jsdoc: ['javascript', 'javadoclike', 'typescript'],
  'js-extras': ['javascript'],
  json5: ['json'],
  jsonp: ['json'],
  'js-templates': ['javascript'],
  kotlin: ['clike'],
  latte: ['clike', 'markup-templating', 'php'],
  less: ['css'],
  lilypond: ['scheme'],
  liquid: ['markup-templating'],
  markdown: ['markup'],
  'markup-templating': ['markup'],
  mongodb: ['javascript'],
  n4js: ['javascript'],
  objectivec: ['c'],
  opencl: ['c'],
  parser: ['markup'],
  php: ['markup-templating'],
  phpdoc: ['php', 'javadoclike'],
  'php-extras': ['php'],
  plsql: ['sql'],
  processing: ['clike'],
  protobuf: ['clike'],
  pug: ['markup', 'javascript'],
  purebasic: ['clike'],
  purescript: ['haskell'],
  qsharp: ['clike'],
  qml: ['javascript'],
  qore: ['clike'],
  racket: ['scheme'],
  cshtml: ['markup', 'csharp'],
  jsx: ['markup', 'javascript'],
  tsx: ['jsx', 'typescript'],
  reason: ['clike'],
  ruby: ['clike'],
  sass: ['css'],
  scss: ['css'],
  scala: ['java'],
  'shell-session': ['bash'],
  smarty: ['markup-templating'],
  solidity: ['clike'],
  soy: ['markup-templating'],
  sparql: ['turtle'],
  sqf: ['clike'],
  squirrel: ['clike'],
  stata: ['mata', 'java', 'python'],
  't4-cs': ['t4-templating', 'csharp'],
  't4-vb': ['t4-templating', 'vbnet'],
  tap: ['yaml'],
  tt2: ['clike', 'markup-templating'],
  textile: ['markup'],
  twig: ['markup-templating'],
  typescript: ['javascript'],
  v: ['clike'],
  vala: ['clike'],
  vbnet: ['basic'],
  velocity: ['markup'],
  wiki: ['markup'],
  xeora: ['markup'],
  'xml-doc': ['markup'],
  xquery: ['markup'],
};

/** CDN base URL for dynamically loading Prism grammar components. Override before first load. */
let componentsBaseUrl = 'https://cdn.jsdelivr.net/npm/prismjs@1.30.0/components/';

/** Override the CDN base URL for Prism grammar components (e.g. for a custom CDN or local hosting). */
export const setComponentsBaseUrl = (url: string): void => {
  componentsBaseUrl = url;
};

const failedLangs = new Set<string>();
const loadingPromises = new Map<string, Promise<void>>();
const loadListeners: Array<(lang: string) => void> = [];
const errorListeners: Array<(lang: string, error: unknown) => void> = [];

/** Returns true if the grammar for the given language is available in Prism. */
export const isLanguageLoaded = (lang: string): boolean => !!prism.languages[lang];

/** Returns true if the grammar is currently being loaded (including its dependencies). */
export const isLanguagePending = (lang: string): boolean => loadingPromises.has(lang);

/** Returns true if the last load attempt for this language failed. */
export const isLanguageFailed = (lang: string): boolean => failedLangs.has(lang);

/**
 * Registers a listener called each time a language grammar finishes loading.
 * Returns an unsubscribe function.
 */
export const onLanguageLoad = (listener: (lang: string) => void): (() => void) => {
  loadListeners.push(listener);
  return () => {
    const i = loadListeners.indexOf(listener);
    if (i >= 0) loadListeners.splice(i, 1);
  };
};

/**
 * Registers a listener called when a language grammar fails to load.
 * Returns an unsubscribe function.
 */
export const onLanguageError = (listener: (lang: string, error: unknown) => void): (() => void) => {
  errorListeners.push(listener);
  return () => {
    const i = errorListeners.indexOf(listener);
    if (i >= 0) errorListeners.splice(i, 1);
  };
};

/** Returns true if the language grammar is already registered in Prism. */
export const hasLang = (lang: string): boolean => !!prism.languages[lang];

/**
 * Loads a language grammar and all its transitive dependencies.
 * Concurrent calls for the same language return the same promise (deduplicated).
 * Throws if the grammar or any dependency fails to load.
 */
export const loadLang = (lang: string): Promise<void> => {
  if (hasLang(lang)) return Promise.resolve();
  if (failedLangs.has(lang)) return Promise.reject(new Error(`Grammar failed to load: ${lang}`));
  if (loadingPromises.has(lang)) return loadingPromises.get(lang)!;

  const p = (async () => {
    const deps = LANGUAGE_DEPS[lang] ?? [];
    for (const dep of deps) await loadLang(dep);
    if (!hasLang(lang)) {
      const src = componentsBaseUrl + 'prism-' + lang + '.min.js';
      await loadScript(src);
    }
  })().then(
    () => {
      loadingPromises.delete(lang);
      for (const listener of loadListeners) listener(lang);
    },
    (error: unknown) => {
      loadingPromises.delete(lang);
      failedLangs.add(lang);
      for (const listener of errorListeners) listener(lang, error);
      throw error;
    },
  );

  loadingPromises.set(lang, p);
  return p;
};
