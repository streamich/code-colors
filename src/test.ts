import {highlight} from "./hljs";

const main = async () => {
  const code = `
    const hljs = require('highlight.js/lib/common');

    const res = hljs.highlight('<h1>Hello World!</h1>', {language: 'xml'});
    console.log(res);
  `;

  const res1 = await highlight('foo();', 'latex');

  console.log(res1);
};

main();