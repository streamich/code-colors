import type {HljsNode, Token, TokenNode} from "./types";
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

const tokenRegex = /[_:]/g;

const normalizeToken = (node: HljsNode): Token => {
  if (typeof node === 'string') return node.length;
  const {children, language, scope = ''} = node;
  const normalizedScope = scope.replace(tokenRegex, '-').split('.');;
  const tokenChildren: Token[] = [];
  const length = children.length;
  for (let i = 0; i < length; i++) {
    const child = normalizeToken(children[i]);
    const last = tokenChildren[tokenChildren.length - 1];
    if (typeof child === 'number' && typeof last === 'number')
      tokenChildren[tokenChildren.length - 1] = last + child;
    else tokenChildren.push(child);
  }
  const token: Token = [normalizedScope, tokenChildren];
  if (language) token.push(language);
  return token;
};

export const highlight = (code: string, lang?: string): TokenNode => {
  if (lang) lang = lang.toLowerCase();
  try {
    const {language, _emitter} = lang ? hljs.highlight(code, {language: lang}) : hljs.highlightAuto(code);
    const token = normalizeToken(_emitter.rootNode as HljsNode) as TokenNode;
    token[0] = ['language-' + language]; 
    return token;
  } catch (error) {
    if (error && typeof error === 'object' && typeof error.message === 'string' && error.message.startsWith('Unknown language:')) {
      const {language, _emitter} = hljs.highlightAuto(code);
      const token = normalizeToken(_emitter.rootNode as HljsNode) as TokenNode;
      token[0] = ['language-' + language]; 
      return token;
    }
    throw error;
  }
};
