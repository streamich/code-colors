import * as prism from 'prismjs';
import * as prismutils from './prismutils';
import {printTree} from 'tree-dump/lib/printTree';
import type {TokenNode, Token} from './types';
import {aliases} from './aliases';

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
  if (!prismutils.hasLang(lang) && aliases[lang]) lang = aliases[lang];
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
