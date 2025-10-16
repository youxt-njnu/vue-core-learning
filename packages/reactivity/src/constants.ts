export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
}

export enum DirtyLevels {
  NoDirty = 0, // computed 使用上一次的返回结果
  Dirty = 4, // computed 需要执行
}