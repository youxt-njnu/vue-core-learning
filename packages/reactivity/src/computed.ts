import { isFunction } from "@vue/shared";
import { ReactiveEffect } from "./effect";
import { trackRefValue, triggerRefValue } from "./ref";

class ComputedRefImpl {
  public _value = undefined; // 作为computed的getter函数里传入的oldValue
  public effect; // 默认都是public修饰，constructor里的如果不加上public，默认就是普通参数，加上了会变成实例的属性
  constructor(getter,public setter) {
    this.effect = new ReactiveEffect(() => getter(this._value), () => {
      // 每次依赖的属性变化了，就需要重新执行当前的这个scheduler
      triggerRefValue(this); // 让当前的computed属性依赖的effect重新执行
    })
  }

  get value() {
    // 在这里进行computed的缓存的处理
    if(this.effect.dirty) {
      // 默认取值一定是脏的，但执行一次run之后，就不脏了
      this._value = this.effect.run();
      // 对effect进行依赖收集
      trackRefValue(this);
    }
    return this._value;
  }
  set value(v) {
    this.setter(v);
  }
}
/** 使用方法
 * 1：computed() 传入一个函数，函数的作用类似于effect的函数
 * 2：传入一个对象，对象具备了get和set方法，可以对计算属性进行读写操作
 */
export function computed(getterOrOptions) {
  let getter, setter;
  if(isFunction(getterOrOptions)) {
    getter = getterOrOptions
    setter = () => {};
  }
  else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  return new ComputedRefImpl(getter,setter);
}