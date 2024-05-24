import type {Grammar} from './types';

export type TokenStream = (string | Token)[];

export class Token {
  public length: number;

  constructor (
    public type: string,
    public content: string | TokenStream,
    public alias: string | string[],
    matchedStr?: string,
  ) {
    this.length = (matchedStr || '').length | 0;
  }
}

function matchPattern(pattern: RegExp, pos: number, text: string, lookbehind: boolean): RegExpExecArray | null {
  pattern.lastIndex = pos;
  var match = pattern.exec(text);
  if (match && lookbehind && match[1]) {
    // change the match to remove the text matched by the Prism lookbehind group
    var lookbehindLength = match[1].length;
    match.index += lookbehindLength;
    match[0] = match[0].slice(lookbehindLength);
  }
  return match;
}

export interface RematchOptions {
  cause: string;
  reach: number;
}

export function matchGrammar(text: string, tokenList: LinkedList<string | Token>, grammar: any, startNode: LinkedListNode<string | Token>, startPos: number, rematch?: RematchOptions): void {
  for (var token in grammar) {
    if (!grammar.hasOwnProperty(token) || !grammar[token]) {
      continue;
    }

    var patterns = grammar[token];
    patterns = Array.isArray(patterns) ? patterns : [patterns];

    for (var j = 0; j < patterns.length; ++j) {
      if (rematch && rematch.cause == token + ',' + j) {
        return;
      }

      var patternObj = patterns[j];
      var inside = patternObj.inside;
      var lookbehind = !!patternObj.lookbehind;
      var greedy = !!patternObj.greedy;
      var alias = patternObj.alias;

      if (greedy && !patternObj.pattern.global) {
        // Without the global flag, lastIndex won't work
        var flags = patternObj.pattern.toString().match(/[imsuy]*$/)[0];
        patternObj.pattern = RegExp(patternObj.pattern.source, flags + 'g');
      }

      /** @type {RegExp} */
      var pattern = patternObj.pattern || patternObj;

      for ( // iterate the token list and keep track of the current token/string position
        var currentNode = startNode.next, pos = startPos;
        currentNode !== tokenList.tail;
        pos += currentNode.value!.length, currentNode = currentNode.next
      ) {

        if (rematch && pos >= rematch.reach) {
          break;
        }

        var str = currentNode!.value;

        if (tokenList.length > text.length) {
          // Something went terribly wrong, ABORT, ABORT!
          return;
        }

        if (str instanceof Token) {
          continue;
        }

        var removeCount = 1; // this is the to parameter of removeBetween
        var match;

        if (greedy) {
          match = matchPattern(pattern, pos, text, lookbehind);
          if (!match || match.index >= text.length) {
            break;
          }

          var from = match.index;
          var to = match.index + match[0].length;
          var p = pos;

          // find the node that contains the match
          p += currentNode!.value!.length;
          while (from >= p) {
            currentNode = currentNode!.next;
            p += currentNode!.value!.length;
          }
          // adjust pos (and p)
          p -= currentNode!.value!.length;
          pos = p;

          // the current node is a Token, then the match starts inside another Token, which is invalid
          if (currentNode!.value instanceof Token) {
            continue;
          }

          // find the last node which is affected by this match
          for (
            var k = currentNode;
            k !== tokenList.tail && (p < to || typeof k!.value === 'string');
            k = k!.next
          ) {
            removeCount++;
            p += k!.value!.length;
          }
          removeCount--;

          // replace with the new match
          str = text.slice(pos, p);
          match.index -= pos;
        } else {
          match = matchPattern(pattern, 0, str!, lookbehind);
          if (!match) {
            continue;
          }
        }

        // eslint-disable-next-line no-redeclare
        var from = match.index;
        var matchStr = match[0];
        var before = str!.slice(0, from);
        var after = str!.slice(from + matchStr.length);

        var reach = pos + str!.length;
        if (rematch && reach > rematch.reach) {
          rematch.reach = reach;
        }

        var removeFrom = currentNode!.prev;

        if (before) {
          removeFrom = addAfter(tokenList, removeFrom!, before);
          pos += before.length;
        }

        removeRange(tokenList, removeFrom!, removeCount);

        var wrapped = new Token(token, inside ? tokenize(matchStr, inside) : matchStr, alias, matchStr);
        currentNode = addAfter(tokenList, removeFrom!, wrapped);

        if (after) {
          addAfter(tokenList, currentNode, after);
        }

        if (removeCount > 1) {
          // at least one Token object was removed, so we have to do some rematching
          // this can only happen if the current pattern is greedy

          /** @type {RematchOptions} */
          var nestedRematch = {
            cause: token + ',' + j,
            reach: reach
          };
          matchGrammar(text, tokenList, grammar, currentNode.prev!, pos, nestedRematch);

          // the reach might have been extended because of the rematching
          if (rematch && nestedRematch.reach > rematch.reach) {
            rematch.reach = nestedRematch.reach;
          }
        }
      }
    }
  }
}

export interface LinkedListNode<T> {
  value: T | null;
  prev: LinkedListNode<T> | null;
  next: LinkedListNode<T> | null;
}

export class LinkedList<T> {
  public head: LinkedListNode<T>;
  public tail: LinkedListNode<T>;
  public length: number;
  constructor() {
    this.head = { value: null, prev: null, next: null };
    this.tail = { value: null, prev: this.head, next: null };
    this.head.next = this.tail;
    this.length = 0;
  }
}

const addAfter = <T>(list: LinkedList<T>, node: LinkedListNode<T>, value: T): LinkedListNode<T> => {
  const next = node.next;
  const newNode: LinkedListNode<T> = { value, prev: node, next };
  node.next = newNode;
  if (next) next.prev = newNode;
  list.length++;
  return newNode;
};

const removeRange = <T>(list: LinkedList<T>, node: LinkedListNode<T>, count: number): void => {
  let next = node.next;
  for (var i = 0; i < count && next !== list.tail; i++)
    if (next) next = next.next;
  node.next = next;
  if (next) next.prev = node;
  list.length -= i;
};

const toArray = <T>(list: LinkedList<T>): T[] => {
  var array: T[] = [];
  var node = list.head.next;
  while (node !== list.tail) {
    array.push(node!.value!);
    node = node!.next;
  }
  return array;
};

export const tokenize = (text: string, grammar: Grammar): TokenStream => {
  var rest = grammar.rest;
  if (rest) {
    for (var token in rest) {
      grammar[token] = rest[token];
    }
    delete grammar.rest;
  }
  var tokenList = new LinkedList<string>();
  addAfter(tokenList, tokenList.head, text);
  matchGrammar(text, tokenList, grammar, tokenList.head, 0);
  return toArray(tokenList);
};
