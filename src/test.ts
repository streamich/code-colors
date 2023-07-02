import {highlight} from "./hljs";
import {CodeColors} from "./CodeColors";

const main = async () => {
  const code = `
    const hljs = require('highlight.js/lib/common');

    const res = hljs.highlight('<h1>Hello World!</h1>', {language: 'xml'});
    console.log(res);
  `;

  console.log('Can auto-detect and parse JavaScript');
  const res1 = await highlight(code);
  console.log('js', res1);
  console.assert(res1[0] === 'language-javascript', 'Auto-detection failed');
  console.assert(res1[1].length > 10, 'Returned unexpected number of tokens');

  console.log('Can parse nested languages');
  const res2 = await highlight('<h1>Hello World!</h1><style>.test {border: 1px solid red;}</style>');
  console.log('xml', res2);
  console.assert(res2[0] === 'language-xml', 'Auto-detection failed');
  
  console.log('Can parse JavaScript in Worker thread');
  const url = (<any>document.currentScript).src;
  console.log('Worker URL:', url);
  const colors = new CodeColors(url);
  const res3 = await colors.highlight(code);
  console.log('js from worker', res3);
  console.assert(JSON.stringify(res3) === JSON.stringify(res1), 'Unexpected result from worker');
};

if (typeof window !== 'undefined') {
  main();
}
