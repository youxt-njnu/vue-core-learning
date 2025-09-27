import { reactiveEffect, trackEffect, triggerEffects } from "./effect";

const targetMap = new WeakMap();

/** 用于清理不需要的属性 */
export const createDep = (cleanup,name) => {
  const deps = new Map() as any;
  deps.cleanup = cleanup;
  deps.name = name;
  return deps;
}

export function track(target,key) {
  if(!reactiveEffect) {
    return;
  }

  let depsMap = targetMap.get(target);
  if(!depsMap) {
    depsMap = new Map(); // 因为depsMap里的key是string，而weakMap的key必须是obj
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if(!dep) {
    dep = createDep(()=> depsMap.delete(key),key);
    depsMap.set(key, dep);
  }
  trackEffect(reactiveEffect,dep); // 把当前的reactiveEffect，放入到deps的map的里面
  // console.log(targetMap);
}

/** 
 * targetMap:
 * {
 *  {name:"11",age:18}: 
 *    depsMap:
 *    {
 *      name: {e1,e2}, // dep
 *      age: {e1}
 *    }
 *  ...
 * }
 */

export function trigger(target,key,value,oldValue) {
  const depsMap = targetMap.get(target);
  if(!depsMap) {
    return;
  }
  const dep = depsMap.get(key);
  if(dep) {
    // deps的key变动的时候，所有effect都可以重新执行
    triggerEffects(dep);
  }
}