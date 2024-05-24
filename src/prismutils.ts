import * as prism from 'prismjs';
import {loadScript} from './util';

const COMPONENTS_BASE_PATH = 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/components/';

export const loadLang = async (lang: string) => {
  const src = COMPONENTS_BASE_PATH + 'prism-' + lang + '.min.js';
  await loadScript(src);
};

export const hasLang = (lang: string) => {
  return !!prism.languages[lang];
};
