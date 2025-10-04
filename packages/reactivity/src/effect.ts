export function effect(fn, options?) {

  // 创建响应式effect，数据变动了，则重新执行回调
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  })
  // 支持options里自定义属性
  /** 
   * case:
   * effect(() => {
   *  console.log(state.name + state.age);
   * },
   * {
   *  scheduler: () => {
   *    console.log("不走默认scheduler的逻辑（也就是上面的()=>{ _effect.run(); }），而是走自定义的这个scheduler")
   *  }
   * })
   */

  // 支持自定义调度器(scheduler)等配置
  if(options) {
    Object.assign(_effect,options);
  }

  _effect.run();

  const runner = _effect.run.bind(_effect);
  runner.effect = _effect; 
  return runner; // 支持自定义调用effect的run方法，也可以通过runner.effect再访问到effect
}

function preCleanEffect(effect) {
  effect._depsLength = 0;
  effect._trackId++; // 每次执行run的时候，id++, 如果当前是同一个effect执行（一次run里面的），那么id是相同的
 
}

function postCleanEffect(effect) {
  if(effect._depsLength === effect.deps.length) {
    return;
  }
  for(let i = effect._depsLength; i < effect.deps.length; i++) {
    cleanDepEffect(effect.deps[i],effect); // dep维度的更新
  }
  effect.deps.length = effect._depsLength; // effect维度的更新
}

export let reactiveEffect; 
// 全局变量，指向当前正在执行的effect，并导出给baseHandler，
// 使得当effect的fn执行的时候，baseHandler可以获取到当前正在执行的effect
// 从而可以把当前正在执行的effect添加到属性的依赖列表中
class ReactiveEffect {
  _trackId = 0; // 用于标识当前effect的依赖收集次数，每次依赖收集次数加1
  _running = 0; // 当前effect不在运行,为了解决case6的问题
  _depsLength = 0; // 用于标识当前effect依赖的属性的数量
  deps = []; // 用于存储当前effect依赖的属性的deps
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
      preCleanEffect(this); // 执行前，清除当前effect的依赖 case4
      /** 
       * case4
       * effect(()=> {
       *  console.log(state.flag ? state.name : state.age);
       * })
       * setTimeout(() => {
          执行前，effect依赖的是state.flag和state.name
          state.flag = !state.flag;
          执行后，effect依赖的是state.flag和state.age
          但如果后续修改了state.name，因为原先依赖过state.name，effect仍会执行，
          所以需要在执行前，清除当前effect的依赖
       }, 1000);
       */
      this._running++;
      return this.fn(); // 执行fn，需要进行依赖收集 state.name, state.age
    }
    finally {
      this._running--;
      postCleanEffect(this); // 执行后，清除当前effect的多余依赖 case4
      /** case4
       * 当这次的effect.deps为[flag,age],
       * 上次的effect.deps为[flag,age,aa,bb]
       * 需要清除掉aa,bb关联的依赖
       */
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

/** 清理依赖
 * 当一个属性的依赖列表中，存在了当前effect，需要把当前effect从属性的依赖列表中删除
 */
function cleanDepEffect(dep,effect) {
  dep.delete(effect);
  if(dep.size === 0) {
    dep.cleanup();
  }
}

/** 双向收集依赖
 * _trackId 用于记录执行次数，放置一个属性在当前effect中多次依赖收集 - 只收集一次
 * 2. 拿到上一次依赖的最后一个和这次的比较
 */
export function trackEffect(effect, dep) {
  // 需要重新收集依赖，把不需要的依赖删掉

  // dep.set(effect, effect._trackId); // case5
  /** 
   * case5: 
   * 存在了多次重复的state.name的访问，但依赖收集只需要收集一次
   * effect(() => {
   *  console.log(state.name, state.name,state.name);
   * })
   */
  if(dep.get(effect) !== effect._trackId) {
    dep.set(effect, effect._trackId); // 只有第一次访问时，才需要收集依赖

    // { flag, name }
    // { flag, age }
    const oldDep = effect.deps[effect._depsLength];
    // 如果没有存过
    if(oldDep !== dep) {
      if(oldDep) {
        // dep维度的更新
        cleanDepEffect(oldDep,effect);
      }
      // effect维度的更新
      effect.deps[effect._depsLength++] = dep;
    }
    else {
      effect._depsLength++;
    }
  }
  // effect.deps[effect._depsLength++] = dep;
  // console.log(effect.deps);
}

export function triggerEffects(dep) {
  for(const effect of dep.keys()) {
    if(!effect._running) {
      effect.scheduler(); // 等价于effect执行run
    }
  }
}