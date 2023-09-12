// 创建 Identifier 节点
function createIdentifier(name) {
  return {
    type: 'Identifier',
    name
  }
}

// 创建 ArrayExpression 节点
function createArrayExpression(elements) {
  return {
    type: 'ArrayExpression',
    elements
  }
}

// 创建 CallExpression 节点
function createCallExpression(callee, args) {
  return {
    type: 'CallExpression',
    callee: createIdentifier(callee),
    arguments: args
  }
}

// 创建 FunctionDecl 节点
function createFunctionDecl(id, params, body) {
  return {
    type: 'FunctionDeclaration',
    id,
    params,
    body
  }
}

// 创建 ReturnStatement 节点
function createReturnStatement(result) {
  return {
    type: 'ReturnStatement',
    return: result
  }
}

// 打印AST
function dump(ast, layer = 1) {
  const currentNode = ast
  const desc = currentNode.type === "Element" ? "Element: " + currentNode.tag : currentNode.type === "Text" ? "Text: " + currentNode.content : currentNode.type === 'Root' ? 'Root' : ''
  console.log('--'.repeat(layer) + desc)
  const children = currentNode.children
  if (children) {
    for (let i = 0; i < children.length; i++) {
      dump(children[i], layer + 1)
    }
  }
}

function initTransformer(transformers) {

  function traverseNode(ast, context) {
    context.currentNode = ast
    // 退出阶段的回调队列
    const exitFns = []
    const { childIndex, parent } = context
    const transformers = context.nodeTransformers
    for (const transformer of transformers) {
      const onExit = transformer(context.currentNode, context)
      if (onExit) exitFns.push(onExit)
      // 如果该元素已经置空，则不做后续处理
      if (!context.currentNode) return
    }

    const children = context.currentNode.children
    if (children) {
      for (let i = 0; i < children.length; i++) {
        // 完善上下文
        context.parent = context.currentNode
        context.childIndex = i
        traverseNode(children[i], context)
      }
    }

    // 恢复上下文状态
    context.childIndex = childIndex
    context.currentNode = ast
    context.parent = parent

    // 倒序清空回调队列
    let i = exitFns.length
    while (i--) {
      exitFns[i]()
    }
  }

  return function (ast) {
    const context = {
      // 当前正在转换的节点
      currentNode: null,
      // 当前节点在父节点的索引
      childIndex: 0,
      // 当前节点的父节点
      parent: null,
      // 节点替换
      replaceNode(node) {
        // 修改上下文中的当前节点
        context.currentNode = node;
        // 替换节点
        context.parent.children[context.childIndex] = node
      },
      // 移除节点
      removeNode() {
        context.currentNode = null
        context.parent.children.splice(context.childIndex, 1)
      },
      // 转换函数
      nodeTransformers: transformers
    }
    traverseNode(ast, context)
    return ast.jsNode
  }
}


// 创建 StringLiteral 节点
function createStringLiteral(value) {
  return {
    type: 'StringLiteral',
    value
  }
}

// 转换文本节点
function transformText(node) {
  if (node.type !== 'Text') return
  // 创建 JavaScript 文本节点
  node.jsNode = createStringLiteral(node.content)
}

// 转换标签节点
function transformElement(node) {
  // 应在退出阶段
  return () => {
    if (node.type !== 'Element') return
    const callExp = createCallExpression('h', [createStringLiteral(node.tag)])
    // h('div', [h('p', 'Vue'), h('p', 'Template')])
    if (node.children.length === 1) callExp.arguments.push(node.children[0].jsNode)
    else callExp.arguments.push(createArrayExpression(node.children.map(c => c.jsNode)))
    callExp.arguments
    node.jsNode = callExp
  }
}

// 转换 Root 节点
function transformRoot(node) {
  return () => {
    if (node.type !== 'Root') return
    const vnodeJSAST = node.children[0].jsNode
    node.jsNode = createFunctionDecl(createIdentifier('render'), [createIdentifier('h')], [createReturnStatement(vnodeJSAST)])
  }
}

export default initTransformer([transformText, transformElement, transformRoot])