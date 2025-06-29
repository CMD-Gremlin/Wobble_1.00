import Parser from "tree-sitter";
import TSTypeScript from "tree-sitter-typescript";
const { typescript } = TSTypeScript;
import crypto from "node:crypto";

export interface Chunk {
  id: string;
  code: string;
  meta: { file: string; kind: string; line: number };
}

const parser = new Parser();
parser.setLanguage(typescript);

export function chunk(source: string, file = "widget.tsx"): Chunk[] {
  const tree = parser.parse(source);
  const chunks: Chunk[] = [];

  tree.rootNode.children.forEach(node => {
    if (["function_declaration", "class_declaration"].includes(node.type)) {
      const text = source.slice(node.startIndex, node.endIndex);
      const id = crypto.createHash("sha256").update(text).digest("hex");
      chunks.push({
        id,
        code: text,
        meta: { file, kind: node.type, line: node.startPosition.row },
      });
    }
  });

  if (chunks.length === 0) {
    const id = crypto.createHash("sha256").update(source).digest("hex");
    chunks.push({ id, code: source, meta: { file, kind: "file", line: 0 } });
  }

  return chunks;
}
