import { activeEffect, trackEffect, triggerEffects } from "./effect";
import { toReactive } from "./reactive";
import { createDep } from "./reactiveEffect";

// ref, shallowRef
export function ref(value) {
  return createRef(value);
}

function createRef(value) {
  return new RefImpl(value);
}

class RefImpl {
  __v_isRef = true; // ref标识
  _value; // 保存ref的值
  dep; // 保存effect
  constructor(public rawValue) {
    this._value = toReactive(rawValue);
  }

  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newValue) {
    if(newValue !== this.rawValue) {
      this.rawValue = newValue;
      this._value = newValue;
      triggerRefValue(this);
    }
  }
}

function trackRefValue(ref) {
  if(activeEffect) {
    trackEffect(activeEffect,ref.dep = createDep(()=> ref.dep = undefined, 'undefined'));
  }
}

function triggerRefValue(ref) {
  if(ref.dep) {
    triggerEffects(ref.dep);
  }
}

class ObjectRefImpl {
  __v_isRef = true;
  constructor(public _object,public _key){}
  get value() {
    return this._object[this._key];
  }
  set value(newVal) {
    this._object[this._key] = newVal;
  }
}

export function toRef(object,key) {
  return new ObjectRefImpl(object,key);
}

export function toRefs(object) {
  let res = {};
  for(let key in object) {
    res[key] = toRef(object,key);
  }
  return res;
}

export function proxyRefs(objectWithRef) {
  return new Proxy(objectWithRef, {
    get(target,key,receiver) {
      const v = Reflect.get(target,key,receiver);
      return v.__v_isRef ? v.value : v;
    },
    set(target,key,value,receiver) {
      const oldV = target[key];
      if(oldV.__v_isRef) {
        oldV.value = value;
        return true;
      }
      else {
        return Reflect.set(target,key,value,receiver);
      }
    }
  })
}