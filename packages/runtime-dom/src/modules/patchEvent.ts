function createInvoker(fn) {
  const invoker = (e) => {
    invoker.value(e);
  }
  invoker.value = fn; // 更改invoker里的value属性，可以修改对应的调用函数
  return invoker;
}

// name: onClick
export function patchEvent(el, name, nextValue) {
  // vue event invoker
  const invokers = el._vei || (el._vei = {});
  const eventName = name.slice(2).toLowerCase(); // click 

  // 是否存在旧的事件调用器
  const existingInvoker = invokers[name];
  if(existingInvoker && existingInvoker.value === nextValue) {
    return;
  }
  if(existingInvoker && nextValue === null) {
    el.removeEventListener(eventName, existingInvoker);
    delete invokers[name];
    return;
  }
  
  // 存在旧的事件调用器，但是新的事件处理函数不为空，只需要替换掉value的值即可
  if(existingInvoker && nextValue) {
    existingInvoker.value = nextValue;
    return;
  }

  if(nextValue) {
    invokers[name] = createInvoker(nextValue);
    const invoker = invokers[name];
    el.addEventListener(eventName, invoker);
  }
}