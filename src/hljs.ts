import type {HighlightResult, Token} from "./types";
const hljs = require('highlight.js/lib/common');

hljs.configure({
  classPrefix: '',
});

const parser = new DOMParser();

export const highlight = (code: string): HighlightResult => {
  const {value, language} = hljs.highlightAuto(code);
  const doc = parser.parseFromString(value, 'text/html');
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
  return [language, tokens];
};
