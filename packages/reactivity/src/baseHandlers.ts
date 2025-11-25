import { isObject } from "@my-vue/shared";
import { reactive } from './reactive';
import { track, trigger } from "./reactiveEffect";
import { ReactiveFlags } from "./constants";

// proxy + Reflect
export const handlerOptions:ProxyHandler<any> = {
  get(target, key, receiver) {
    // 能进入get，劫持到对属性的访问，说明已经具备了get和set，说明已经代理过了
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true;
    }
    // 需要把属性和effect关联起来
    // 依赖收集 
    // console.log(reactiveEffect,key);
    track(target,key);

    // return target[key]; // 有问题，具体见test-1
    const result = Reflect.get(target, key, receiver);
    /** 递归代理
     * 当前值也是一个对象，则需要递归代理这个对象
     * state.address = {country: aaa, number:bbb}
     */
    if(isObject(result)) {
      return reactive(result);
    }
    return result;
  },
  set(target, key, value, receiver) {
    // target[key]=value; // 有问题，具体见test-1

    // 找到属性，让对应的effect都执行下
    // 触发依赖更新
    const oldValue = target[key];
    const result = Reflect.set(target, key, value, receiver);
    if(oldValue !== value) {
      trigger(target,key,value,oldValue);
    }
    return result;
  }
}