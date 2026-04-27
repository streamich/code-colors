import * as prism from 'prismjs';
import * as prismutils from './prismutils';
import {printTree} from 'tree-dump/lib/printTree';
import type {TokenNode, Token} from './types';
import {aliases} from './aliases';

export class LanguageNotLoadedError extends Error {
  public readonly lang: string;
  constructor(lang: string) {
    super(`Grammar not loaded: ${lang}`);
    this.name = 'LanguageNotLoadedError';
    this.lang = lang;
  }
}

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
  const grammar = prism.languages[lang];
  if (!grammar) throw new LanguageNotLoadedError(lang);
  const children = prism.tokenize(code, grammar);
  const token: TokenNode = [['language-' + lang], []];
  collectChildren(children, token[1]);
  return token;
};

export const tokenizeAsync = async (code: string, lang: string): Promise<TokenNode> => {
  lang = lang.toLowerCase();
  let resolvedLang = lang;
  if (!prismutils.hasLang(lang) && aliases[lang]) {
    const alias = aliases[lang];
    const chain = Array.isArray(alias) ? (alias as string[]) : [alias as string];
    resolvedLang = chain[chain.length - 1];
  }
  await prismutils.loadLang(resolvedLang);
  return tokenize(code, resolvedLang);
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
