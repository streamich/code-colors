import {highlight} from './highlight';

if (typeof window !== 'undefined') {
  (<any>window).highlight = highlight;
}
