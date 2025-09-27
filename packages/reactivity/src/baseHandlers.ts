
export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
}

// proxy + Reflect
export const handlerOptions:ProxyHandler<any> = {
  get(target, key, receiver) {
    // 能进入get，劫持到对属性的访问，说明已经具备了get和set，说明已经代理过了
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true;
    }
    // return target[key]; // 有问题，具体见test-1
    return Reflect.get(target, key, receiver);

    // 需要把属性和effect关联起来
    // 依赖收集 todo
  },
  set(target, key, value, receiver) {
    // target[key]=value; // 有问题，具体见test-1

    // 找到属性，让对应的effect都执行下
    // 触发依赖更新 todo
    return Reflect.set(target, key, value, receiver);
  }
}