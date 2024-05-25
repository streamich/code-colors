import * as tokenize from './tokenize';

if (typeof window !== 'undefined') {
  (<any>window).tokenize = tokenize;
}
