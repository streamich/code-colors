import {CompactMessageType} from "json-joy/lib/reactive-rpc/common/codec/compact/constants";
import {highlight} from "./hljs";

const main = async () => {
  const code = `
    const hljs = require('highlight.js/lib/common');

    const res = hljs.highlight('<h1>Hello World!</h1>', {language: 'xml'});
    console.log(res);
  `;

  console.log('Can auto-detect and parse JavaScript');
  const res1 = await highlight(code);
  console.assert(res1[0] === 'javascript', 'Auto-detection failed');
  // console.assert(res1[1].length === 20, 'Returned unexpected number of tokens');

  console.log('Can parse nested languages');
  const res2 = await highlight('<h1>Hello World!</h1><style>.test {border: 1px solid red;}</style>');
  console.log(res2);
  // console.assert(res1[0] === 'javascript', 'Auto-detection failed');
  // console.assert(res1[1].length === 20, 'Returned unexpected number of tokens');
  
  
  console.log('Can parse JavaScript in Worker thread');
  const url = (<any>document.currentScript).src;
  console.log('Worker URL:', url);
  const worker = new Worker(url);
  worker.onmessage = e => {
    const msg = e.data;
    if (!Array.isArray(msg)) return;
    if (msg[0] !== CompactMessageType.Notification || msg[1] !== 'ready') return;
    console.log('Worker is ready');
    // worker.postMessage(['highlight', {code}]);
  };
};

main();