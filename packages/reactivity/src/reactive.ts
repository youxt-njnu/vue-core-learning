import { isObject } from "@vue/shared";
import { handlerOptions } from "./baseHandlers";
import { ReactiveFlags } from "./constants";

/** 
 * case1: reactiveMap
 * const state1 = reactive(template);
 * const state2 = reactive(template);
 * 两个代理对象指向的是同一个对象
 * state1 === state2
 * 为了提升性能，reactive会缓存代理对象，
 * 当再次调用reactive时，如果代理对象已经存在，
 * 则直接返回缓存的代理对象，而不是创建新的代理对象
 */

/** 
 * case2: ReactiveFlags.IS_REACTIVE
 * const state1 = reactive(template);
 * const state2 = reactive(state1);
 * state1 === state2
 * 为了避免代理对象的再次被代理，直接返回代理对象
 */
const reactiveMap = new WeakMap();

export function createReactiveObject(target) {
  if (!isObject(target)) {
    return target;
  }
  if(target[ReactiveFlags.IS_REACTIVE]) {
    return target;
  }
  const existProxy = reactiveMap.get(target);
  if (existProxy) {
    return existProxy;
  }
  let proxy = new Proxy(target, handlerOptions);
  reactiveMap.set(target, proxy);
  return proxy;
}

export function reactive(target) {
  return createReactiveObject(target);
}

export function toReactive(value) {
  return isObject(value) ? reactive(value) : value;
}

export function isReactive(value) {
  return Boolean(value && value[ReactiveFlags.IS_REACTIVE]);
}