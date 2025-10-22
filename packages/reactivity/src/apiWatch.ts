import { isFunction, isObject } from "@vue/shared";
import { ReactiveEffect } from "./effect";
import { isReactive } from "./reactive";
import { isRef } from "./ref";

export function watch(source, cb, options={}) {
  return doWatch(source, cb, options);
}

export function watchEffect(fn, options={}) {
  return doWatch(fn,null,options);
}

// 递归遍历，seen用于判断是否对象是循环引用的
function traverse(source, depth, curDepth = 0, seen=new Set()) {
  if(!isObject(source)){
    return source;
  }
  if(depth) {
    if(curDepth >= depth) { // 超出深度了
      return source;
    }
    curDepth++; // 当前深度
  }
  if(seen.has(source)) {
    return source;
  }
  for(let i of Object.keys(source)) {
    traverse(source[i], depth, curDepth, seen);
  }
  seen.add(source);
  return source;
}

function doWatch(source, cb, options) {
  const { deep, immediate } = options;
  const reactiveGetter = (source) => traverse(source, deep === false ? 1 : (deep === true ? Infinity: deep));
  // 把source变成getter，然后可以给到reactiveEffect，对当前对象进行取值，可以触发依赖收集
  // 针对watch的不同类型的值，分别处理
  // 1. 响应式对象
  // 2. ref对象
  // 3. 函数
  let getter;
  if(isReactive(source)) {
    getter = () => reactiveGetter(source);
  } else if(isRef(source)) {
    getter = () => source.value;
  } else if(isFunction(source)) {
    getter = source;
  }
  let oldVal;
  let cleanFn;
  const onCleanUp = (fn) => {
    cleanFn = () => {
      fn();
      cleanFn = undefined;
    }
  }
  const job = () => {
    if(cb) {
      let newVal = effect.run();
      if(cleanFn) {
        cleanFn(); // 在执行cb回调之前，如果之前有执行的没有执行完，先清理
      }
      cb(oldVal, newVal,onCleanUp);
      oldVal = newVal;
    }
    else {
      effect.run(); // watchEffect, 直接执行run即可
    }
  }
  const effect = new ReactiveEffect(getter, job);
  
  if(cb) {
    if(immediate) {
      job();
    }
    else {
      oldVal = effect.run();
    }
  }
  else {
    // watchEffect
    effect.run();
  }

  const unwatch = () => {
    effect.stop();
  }
  return unwatch;
}