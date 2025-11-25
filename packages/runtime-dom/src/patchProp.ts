/** 针对节点属性的增删改查操作，如class, style, event */

import { patchAttr } from "./modules/patchAttr"
import { patchClass } from "./modules/patchClass"
import { patchEvent } from "./modules/patchEvent"
import { patchStyle } from "./modules/patchStyle"

// diff 当前元素，属性，之前的属性值，新的属性值
export const patchProp = (el, key, prevValue, nextValue) => {
  if(key === 'class') {
    return patchClass(el, nextValue)
  }
  else if(key === 'style') {
    return patchStyle(el, prevValue, nextValue)
  }
  else if(/^on[^a-z]/.test(key)) {
    return patchEvent(el, key, nextValue)
  }
  else {
    // 普通属性
    return patchAttr(el, key, nextValue)
  }
}