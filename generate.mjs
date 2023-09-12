function genIdentifier(node, context) {
  const { push } = context
  push(`${node.name}`)
}

function genFunctionDeclaration(node, context) {
  const { push, indent, deIndent } = context
  push(`function `)
  genNode(node.id.name, context)
  push(`(`)
  // 处理节点列表，数组不代表就是列表，列表需要有逗号连接
  genNodeList(node.params, context)
  push(`) {`)
  indent()
  node.body.forEach(n => genNode(n, context))
  deIndent()
  push(`}`)
}

function genReturnStatement(node, context) {
  const { push } = context
  push(`return `)
  genNode(node.return, context)
}

function genCallExpression(node, context) {
  const { push } = context
  genNode(node.callee, context)
  push('(')
  genNodeList(node.arguments, context)
  push(')')
}

function genStringLiteral(node, context) {
  const { push } = context
  push(`'${node.value}'`)
}

function genArrayExpression(node, context) {
  const { push } = context
  push(`[`)
  // 处理节点列表，数组不代表就是列表，列表需要有逗号连接
  genNodeList(node.elements, context)
  push(`]`)
}

function genNode(node, context) {
  switch (node.type) {
    case 'Identifier':
      genIdentifier(node, context)
      break
    case 'FunctionDeclaration':
      genFunctionDeclaration(node, context)
      break
    case 'ReturnStatement':
      genReturnStatement(node, context)
      break
    case 'CallExpression':
      genCallExpression(node, context)
      break
    case 'StringLiteral':
      genStringLiteral(node, context)
      break
    case 'ArrayExpression':
      genArrayExpression(node, context)
      break
  }
}

function genNodeList(nodeList, context) {
  const { push } = context
  for (let i = 0; i < nodeList.length; i++) {
    const node = nodeList[i]
    genNode(node, context)
    if (i < nodeList.length - 1) {
      push(', ')
    }
  }
}



export default function (node) {
  const context = {
    code: '',
    push(code) {
      context.code += code
    },
    // 当前的缩进级别
    currentIndent: 0,
    newLine() {
      // 先写成默认两个空格缩进
      context.code += '\n' + '  '.repeat(context.currentIndent)
    },
    // 缩进换行
    indent() {
      context.currentIndent++
      context.newLine()
    },
    // 取消缩进
    deIndent() {
      context.currentIndent--
      context.newLine()
    }
  }

  genNode(node, context)

  return context.code
}