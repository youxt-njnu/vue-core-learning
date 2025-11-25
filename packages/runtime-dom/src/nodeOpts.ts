/** 针对节点的增删改查操作 */

export const nodeOpts = {
  // 如果anchor不存在，等价于appendChild
  insert(el, parent, anchor) {
    parent.insertBefore(el,anchor || null);
  },
  remove(el) {
    const parent = el.parentNode;
    parent && parent.removeChild(el);
  },
  createText: text => document.createTextNode(text),
  createElement: type => document.createElement(type),
  setText: (node, text) => node.nodeValue = text,
  setElementText: (el, text) => el.textContent = text,
  parentNode: (node) => node.parentNode,
  nextSibling: (node) => node.nextSibling, 
}
