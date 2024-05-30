const js = 'javascript';
const ts = [js, 'typescript'];
const tsx = [...ts, 'jsx', 'tsx']

export const aliases: Record<string, string | string[]> = {
  feature: 'cucumber',

  adb: 'ada',
  ads: 'ada',

  ahkl: 'ahk',

  htaccess: 'apacheconf',
  htgroups: 'apacheconf',
  'apache.conf': 'apacheconf',
  'apache2.conf': 'apacheconf',

  as3: 'as',

  sh: 'bash',
  ksh: 'bash',
  ebuild: 'bash',
  eclass: 'bash',

  cmd: 'bat',

  bf: 'brainfuck',
  b: 'brainfuck',

  h: 'c',
  'c-like': 'clike',

  cfml: 'cfm',
  cfc: 'cfm',

  js,
  ecmascript: js,
  cjs: js,
  mjs: js,
  jsx: [js, 'jsx'],

  coffee: 'coffeescript',

  ts,
  dts: ts,
  mts: ts,
  cts: ts,
  'd.ts': ts,
  tsx,

  list: 'cl',
  el: 'cl',

  clj: 'clojure',
  cljs: 'clojure',

  hpp: 'cpp',
  'c++': 'cpp',
  'h++': 'cpp',
  cc: 'cpp',
  hh: 'cpp',
  cxx: 'cpp',
  hxx: 'cpp',
  pde: 'cpp',

  cs: 'csharp',

  py: 'python',
  pyx: 'python',
  pxd: 'python',
  pxi: 'python',
  pyw: 'python',
  sc: 'python',
  sconstruct: 'python',
  tac: 'python',
  sconscript: 'python',

  di: 'd',

  mak: 'makefile',
  gnumakefile: 'makefile',

  md: 'markdown',

  xsl: 'xml',
  rss: 'xml',
  xslt: 'xml',
  xsd: 'xml',
  wsdl: 'xml',

  yml: 'yaml',
};
