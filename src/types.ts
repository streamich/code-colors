export type Token = number | [length: number, type?: string[]];

export type HighlightResult = [language: string, tokens: Token[]];
