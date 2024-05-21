# code-colors

Code syntax highlighting for the web. Uses Prism for parsing.

Why I created this library? I needed a simple React component that highlights
code, but there was none which satisfied the following requirements:

- Dynamically loads highligting parsers.
- Executs highlighting in a web worker.
- While code is parsed in the worker, renders raw un-highlighted source without any flickering.
- A simple to use React component.
