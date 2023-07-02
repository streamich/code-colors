export interface HljsDataNode {
  children: HljsNode[];
  language?: string;
  scope?: string;
}

export type HljsNode = string | HljsDataNode;

export type TokenNode = [type: string, children: Token[], language?: string];
export type Token = number | TokenNode;

export interface HighlightParams {
  code: string;
  lang?: string;
}
