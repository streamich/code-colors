import {highlight} from './hljs';

if (typeof window !== 'undefined') {
  (<any>window).highlight = highlight;
}
