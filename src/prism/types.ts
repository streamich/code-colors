export type GrammarValue = RegExp | TokenObject | Array<RegExp | TokenObject>;
export type Grammar = Record<string, GrammarValue>;

export interface TokenObject {
  pattern: RegExp;
  lookbehind?: boolean | undefined;
  greedy?: boolean | undefined;
  alias?: string | string[] | undefined;
  inside?: Grammar | undefined;
}

export type Languages = LanguageMapProtocol & LanguageMap;

export interface LanguageMap {
  [language: string]: Grammar;
}

export interface LanguageMapProtocol {
  extend(id: string, redef: Grammar): Grammar;
  insertBefore(inside: string, before: string, insert: Grammar, root?: LanguageMap): Grammar;
}
