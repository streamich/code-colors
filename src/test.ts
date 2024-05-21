import {highlight, print} from './highlight';
import {CodeColors} from './CodeColors';
import type {Token} from './types';

const printToken = (str: string, token: Token) => console.log(print(str, token));

const main = async () => {
  const code = `
    const hljs = require('highlight.js/lib/common');

    const res = hljs.highlight('<h1>Hello World!</h1>', {language: 'xml'});
    console.log(res);
  `;

  console.log('Can parse JavaScript');
  const res1 = await highlight(code, 'js');
  console.log('js', res1);
  console.assert(res1[1].length > 10, 'Returned unexpected number of tokens');
  printToken(code, res1);

  console.log('Can parse nested languages');
  const code2 = '<h1>Hello World!</h1><style>.test {border: 1px solid red;}</style>';
  const res2 = await highlight(code2, 'html');
  console.log('xml', res2);
  printToken(code2, res2);

  console.log('Can parse JavaScript in Worker thread');
  const url = (<any>document.currentScript).src;
  console.log('Worker URL:', url);
  const colors = new CodeColors(url);
  const res3 = await colors.highlight(code, 'jsx');
  printToken(code, res3);

  console.log('Can parse JSX');
  const code4 = `
const component = () => <div style={{border: '1px solid red'}}>Hello World!</div>;
  `;
  const res4 = await highlight(code4, 'jsx');
  console.log('jsx', res4);
  printToken(code4, res4);
};

if (typeof window !== 'undefined') {
  main();
}
