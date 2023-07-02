export interface HljsDataNode {
  children: HljsNode[];
  language?: string;
  scope?: string;
}

export type HljsNode = string | HljsDataNode;

export type Token = number | [type: string, children: Token[], language?: string];

export type HighlightResult = [language: string, token: Token | number];

export interface HighlightParams {
  code: string;
  lang?: string;
}
