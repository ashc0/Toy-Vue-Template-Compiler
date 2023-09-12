import compile from "./compile.mjs";

let template = "<div><p>Vue</p><p><span>Template</span><span>Compiler</span></p></div>"

let code = compile(template)

console.log(code)