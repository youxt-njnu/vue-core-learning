export function effect(fn, options) {

  // 创建响应式effect，数据变动了，则重新执行回调
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run();
  })
  
  _effect.run();
}

class ReactiveEffect {
  public active = true; // 创建的effect默认是响应式的
  // 当fn依赖的数据发生了变化，就需要重新执行run方法
  constructor(public fn, public scheduler) {
    
  }

  run() {
    if(!this.active) {
      return this.fn(); // 直接执行fn，不进行依赖收集
    }
    return this.fn(); // todo 执行fn，需要进行依赖收集 state.name, state.age
  }
}