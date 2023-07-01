import {highlight} from "./hljs";

const code = `
const hljs = require('highlight.js/lib/common');

const res = hljs.highlight('<h1>Hello World!</h1>', {language: 'xml'});
console.log(res);
`;

const res1 = highlight(code);
const res2 = highlight(code);

console.log(res2);
