import tokenize from "./tokenize.mjs";
import parse from "./parse.mjs";
import transform from "./transform.mjs";
import generate from "./generate.mjs";

export default function (str) {
  const tokens = tokenize(str)
  const ast = parse(tokens)
  const jsAST = transform(ast)
  const jsCode = generate(jsAST)
  return jsCode
}