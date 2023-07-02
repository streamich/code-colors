import type {HighlightResult, Token} from "./types";
const hljs = require('highlight.js/lib/common');

hljs.configure({classPrefix: ''});
hljs.registerLanguage('cmake', require('highlight.js/lib/languages/cmake'));
hljs.registerLanguage('coffeescript', require('highlight.js/lib/languages/coffeescript'));
hljs.registerLanguage('x86asm', require('highlight.js/lib/languages/x86asm'));
hljs.registerLanguage('pgsql', require('highlight.js/lib/languages/pgsql'));
hljs.registerLanguage('arduino', require('highlight.js/lib/languages/arduino'));
hljs.registerLanguage('dockerfile', require('highlight.js/lib/languages/dockerfile'));
hljs.registerLanguage('tap', require('highlight.js/lib/languages/tap'));
hljs.registerLanguage('elm', require('highlight.js/lib/languages/elm'));
hljs.registerLanguage('ocaml', require('highlight.js/lib/languages/ocaml'));
hljs.registerLanguage('lisp', require('highlight.js/lib/languages/lisp'));
hljs.registerLanguage('gradle', require('highlight.js/lib/languages/gradle'));
hljs.registerLanguage('erlang', require('highlight.js/lib/languages/erlang'));
hljs.registerLanguage('haskell', require('highlight.js/lib/languages/haskell'));
hljs.registerLanguage('armasm', require('highlight.js/lib/languages/armasm'));
hljs.registerLanguage('elixir', require('highlight.js/lib/languages/elixir'));
hljs.registerLanguage('puppet', require('highlight.js/lib/languages/puppet'));
hljs.registerLanguage('latex', require('highlight.js/lib/languages/latex'));
hljs.registerLanguage('powershell', require('highlight.js/lib/languages/powershell'));
hljs.registerLanguage('vim', require('highlight.js/lib/languages/vim'));
hljs.registerLanguage('fsharp', require('highlight.js/lib/languages/fsharp'));

const parser = new DOMParser();
const parseHtml = (html: string): Token[] => {
  const doc = parser.parseFromString(html, 'text/html');
  const list = doc.body.childNodes;
  const tokens: Token[] = [];
  list.forEach((node: Node) => {
    if (node instanceof HTMLElement) {
      const className = node.className;
      const text = node.textContent;
      const length = text?.length || 0;
      const token: Token = [length, className.split(' ')];
      tokens.push(token);
    } else {
      const text = node.textContent;
      const length = text?.length || 0;
      const token: Token = length;
      tokens.push(token);
    }
  });
  return tokens;
};

export const highlight = (code: string, lang?: string): HighlightResult => {
  if (lang) lang = lang.toLowerCase();
  try {
    const {value, language} = lang ? hljs.highlight(code, {language: lang}) : hljs.highlightAuto(code);
    return [language, parseHtml(value)];
  } catch (error) {
    if (error && typeof error === 'object' && typeof error.message === 'string' && error.message.startsWith('Unknown language:')) {
      const {value, language} = hljs.highlightAuto(code);
      return [language, parseHtml(value)];
    }
    throw error;
  }
};
