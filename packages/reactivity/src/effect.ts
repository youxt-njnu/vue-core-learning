export function effect(fn, options?) {

  // 创建响应式effect，数据变动了，则重新执行回调
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  })
  
  _effect.run();
}

export let reactiveEffect; 
// 全局变量，指向当前正在执行的effect，并导出给baseHandler，
// 使得当effect的fn执行的时候，baseHandler可以获取到当前正在执行的effect
// 从而可以把当前正在执行的effect添加到属性的依赖列表中
class ReactiveEffect {
  _trackId = 0; // 用于标识当前effect的依赖收集次数，每次依赖收集次数加1
  deps = []; // 用于存储当前effect依赖的属性的deps
  _depsLength = 0; // 用于标识当前effect依赖的属性的数量
  public active = true; // 创建的effect默认是响应式的
  // 当fn依赖的数据发生了变化，就需要重新执行run方法
  constructor(public fn, public scheduler) {
    
  }

  run() {
    if(!this.active) {
      return this.fn(); // 直接执行fn，不进行依赖收集
    }
    let lastReactiveEffect = reactiveEffect;
    try {
      reactiveEffect = this; // 把当前正在执行的effect赋值给全局变量reactiveEffect
      return this.fn(); // 执行fn，需要进行依赖收集 state.name, state.age
    }
    finally {
      // reactiveEffect = undefined; // 执行完fn后，把全局变量reactiveEffect设为undefined
      reactiveEffect = lastReactiveEffect; // 执行完fn后，把全局变量reactiveEffect设为上一个正在执行的effect，这种处理方式针对的下面的case
      /** 
       * case3: 
       * effect(() => { // e1
       *  console.log(state.name);
       *  effect(() => {  // e2
       *    console.log(state.name);
       *  })
       *  console.log(state.age); // 这个age需要是e1的
       * })
       */
    }
  }
}

/** 双向收集依赖 */
export function trackEffect(effect, dep) {
  dep.set(effect, effect._trackId);
  effect.deps[effect._depsLength++] = dep;
  // console.log(effect.deps);
}

export function triggerEffects(dep) {
  for(const effect of dep.keys()) {
    effect.scheduler(); // 等价于effect执行run
  }
}