import * as prism from 'prismjs';
import * as prismutils from './prismutils';
import {printTree} from 'tree-dump/lib/printTree';
// import * as prism from './prism';
import type {TokenNode, Token} from './types';

// import 'prismjs/components/prism-clike';
// import 'prismjs/components/prism-c';
// import 'prismjs/components/prism-java';
// import 'prismjs/components/prism-json';
// import 'prismjs/components/prism-javascript';
// import 'prismjs/components/prism-jsx';
// import 'prismjs/components/prism-nix';
// import 'prismjs/components/prism-uri';
// import 'prismjs/components/prism-twig';
// import 'prismjs/components/prism-swift';
// import 'prismjs/components/prism-visual-basic';
// import 'prismjs/components/prism-sql';
// import 'prismjs/components/prism-solidity';
// import 'prismjs/components/prism-scss';
// import 'prismjs/components/prism-css';
// import 'prismjs/components/prism-scala';
// import 'prismjs/components/prism-ruby';
// import 'prismjs/components/prism-sass';
// import 'prismjs/components/prism-rest';
// import 'prismjs/components/prism-pug';
// import 'prismjs/components/prism-php';
// import 'prismjs/components/prism-pascal';
// import 'prismjs/components/prism-ocaml';
// import 'prismjs/components/prism-objectivec';
// import 'prismjs/components/prism-nginx';
// import 'prismjs/components/prism-mongodb';
// import 'prismjs/components/prism-matlab';
// import 'prismjs/components/prism-lua';
// import 'prismjs/components/prism-makefile';
// import 'prismjs/components/prism-llvm';
// import 'prismjs/components/prism-less';
// import 'prismjs/components/prism-jsonp';
// import 'prismjs/components/prism-json5';
// import 'prismjs/components/prism-groovy';
// import 'prismjs/components/prism-go';
// import 'prismjs/components/prism-rust';
// import 'prismjs/components/prism-haskell';
// import 'prismjs/components/prism-gradle';
// import 'prismjs/components/prism-graphql';
// import 'prismjs/components/prism-erlang';
// import 'prismjs/components/prism-dart';
// import 'prismjs/components/prism-csv';
// import 'prismjs/components/prism-cpp';
// import 'prismjs/components/prism-csharp';
// import 'prismjs/components/prism-coffeescript';
// import 'prismjs/components/prism-cmake';
// import 'prismjs/components/prism-bash';
// import 'prismjs/components/prism-markdown';
// import 'prismjs/components/prism-asciidoc';
// import 'prismjs/components/prism-typescript';
// import 'prismjs/components/prism-tsx';
// import 'prismjs/components/prism-wasm';
// import 'prismjs/components/prism-wiki';
// import 'prismjs/components/prism-wolfram';
// import 'prismjs/components/prism-xml-doc';
// import 'prismjs/components/prism-yaml';
// import 'prismjs/components/prism-zig';

const collectChildren = (children: (string | prism.Token)[], tokens: Token[]): void => {
  const length = children.length;
  for (let i = 0; i < length; i++) {
    const child = children[i];
    if (typeof child === 'string') {
      const len = child.length;
      tokens.push(len);
    } else if (child instanceof prism.Token) {
      const token: TokenNode = [[child.type], []];
      const alias = child.alias;
      if (alias) {
        if (typeof child.alias === 'string') token[0].push(child.alias);
        else if (alias instanceof Array) token[0].push(...child.alias);
      }
      tokens.push(token);
      let content = child.content;
      if (content === 'string') {
        const len = content.length;
        token[1][0] = len;
      } else {
        if (!(content instanceof Array)) content = [content];
        collectChildren(content, token[1]);
      }
    }
  }
};

export const tokenize = (code: string, lang: string): TokenNode => {
  lang = lang.toLowerCase();
  const grammar = prism.languages[lang] ?? prism.languages[(lang = 'c')];
  // const grammar = prism.getLang(lang) ?? prism.getLang('c')!;
  const children = prism.tokenize(code, grammar);
  const token: TokenNode = [['language-' + lang], []];
  collectChildren(children, token[1]);
  return token;
};

export const tokenizeAsync = async (code: string, lang: string): Promise<TokenNode> => {
  // TODO: Resolve aliases
  if (!prismutils.hasLang(lang)) await prismutils.loadLang(lang);
  return tokenize(code, lang);
};

const printToken0 = (tab: string, str: string, token: Token, offset: number): [string, offset: number] => {
  if (typeof token === 'number')
    return ['(' + offset + ',' + token + '): ' + JSON.stringify(str.slice(offset, offset + token)), offset + token];
  const [type, children] = token;
  return [
    type.join(', ') +
      printTree(
        tab,
        children.map((child) => (tab) => {
          const p = printToken0(tab, str, child, offset);
          offset = p[1];
          return p[0];
        }),
      ),
    offset,
  ];
};

export const print = (str: string, token: Token) => printToken0('', str, token, 0)[0];
