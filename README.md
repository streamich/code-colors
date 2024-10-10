# code-colors

Code syntax highlighting for the web. Uses Prism for parsing.

Why I created this library? I needed a simple React component that highlights
code, but there was none which satisfied the following requirements:

- Dynamically loads highligting parsers.
- Executs highlighting in a web worker.
- While code is parsed in the worker, renders raw un-highlighted source without any flickering.
- A simple to use React component.


## Installation

```bash
npm install code-colors
```


## Usage

Simply call the `tokenizeAsync` function with the code and language you want to highlight.

```javascript
import { tokenizeAsync } from 'code-colors';

const code = `console.log('Hello, World!');`;
const language = 'javascript';

const tokens = await tokenizeAsync(code, language);
console.log(tokens);
```

It will automatically download popular Prism languages from the CDN.
