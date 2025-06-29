declare module 'tree-sitter' {
  export class Parser {
    parse(input: string): Tree;
    setLanguage(language: any): void;
  }

  export class Tree {
    rootNode: SyntaxNode;
  }

  export class SyntaxNode {
    type: string;
    startIndex: number;
    endIndex: number;
    startPosition: Position;
    endPosition: Position;
    children: SyntaxNode[];
  }

  export interface Position {
    row: number;
    column: number;
  }
}

declare module 'tree-sitter-typescript' {
  import type { Language } from 'tree-sitter';
  
  export const typescript: Language;
  export const tsx: Language;
}
