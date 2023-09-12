function initTokenizer() {

  // 设置初始状态
  const State = {
    initState: 1,
    tagOpen: 2,
    tagName: 3,
    text: 4,
    tagEnd: 5,
    tagEndName: 6
  }

  // 判断是否为字母
  function isAlpha(char) {
    return char >= 'a' && char <= 'z' || char >= 'A' && char <= 'Z'
  }

  return function (str) {
    let currentState = State.initState
    const chars = []
    const tokens = []

    while (str) {
      const char = str[0]

      switch (currentState) {
        // 初始状态
        case State.initState:
          if (char === '<') {
            currentState = State.tagOpen
          } else if (isAlpha(char)) {
            currentState = State.text
            chars.push(char)
          }
          str = str.slice(1)
          break
        // 标签开始状态
        case State.tagOpen:
          if (isAlpha(char)) {
            currentState = State.tagName
          } else if (char === '/') {
            currentState = State.tagEnd
            str = str.slice(1)
          }
          break
        case State.tagName:
          if (isAlpha(char)) {
            chars.push(char)
          } else if (char === '>') {
            tokens.push({ type: 'tag', name: chars.join('') })
            chars.length = 0
            currentState = State.initState
          }
          str = str.slice(1)
          break
        case State.text:
          if (isAlpha(char)) {
            chars.push(char)
          } else if (char === '<') {
            tokens.push({ type: 'text', content: chars.join('') })
            chars.length = 0
            currentState = State.tagOpen
          }
          str = str.slice(1)
          break
        case State.tagEnd:
          if (isAlpha(char)) {
            currentState = State.tagEndName
          }
          break
        case State.tagEndName:
          if (isAlpha(char)) {
            chars.push(char)
          } else if (char === '>') {
            tokens.push({ type: 'tagEnd', name: chars.join('') })
            chars.length = 0
            currentState = State.initState
          }
          str = str.slice(1)
          break
      }
    }

    return tokens
  }
}

export default initTokenizer()