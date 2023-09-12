export default function (tokens) {

  // 创建Root节点
  const root = {
    type: 'Root',
    children: []
  }

  const elementStack = [root]

  while (tokens.length) {
    let currentToken = tokens.shift()
    switch (currentToken.type) {
      case 'tag':
        let elementNode = {
          type: 'Element',
          tag: currentToken.name,
          children: []
        }
        elementStack[elementStack.length - 1].children.push(elementNode)
        elementStack.push(elementNode)
        break
      case 'text':
        elementStack[elementStack.length - 1].children.push({
          type: 'Text',
          content: currentToken.content
        })
        break
      case 'tagEnd':
        elementStack.pop()
        break
    }
  }

  return root
}