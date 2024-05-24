import {tokenize} from './highlight';

if (typeof window !== 'undefined') {
  (<any>window).highlight = tokenize;
}
