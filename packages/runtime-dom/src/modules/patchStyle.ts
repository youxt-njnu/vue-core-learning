export const patchStyle = (el, prevValue, nextValue) => {
  let style = el.style;
  for(let key in nextValue) {
    // 新样式要全部生效
    style[key] = nextValue[key]
  }
  if(prevValue) {
    for(let key in prevValue) {
      // 旧样式中有的，新样式中没有的，要移除
      if(!nextValue[key]) {
        style[key] = null
      }
    }
  }
}