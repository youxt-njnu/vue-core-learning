const person = {
  name: '张三',
  age: 18,
  get aliasName() {
    return this.name + '222'
  },
}

const pPerson = new Proxy(person, {
  get(target, key, receiver) {
    // case1: return target[key]
    // 1. 进入到person对象中取值
    // 2. aliasName里的this，对应的是target，也就是person
    // 3. this.name并不会触发pPerson的get的代理，无法实现依赖收集
    // 所以不能是target[key]

    // case2: return receiver[key]
    // 1. receiver是pPerson
    // 2. 但多次访问key，每次访问都会触发get方法，造成死循环

    return Reflect.get(target, key, receiver)
    // 是不会触发死循环的receiver[key]
  },
  set(target, key, value, receiver) {
    target[key] = value
    return true
  },
})

console.log(pPerson.aliasName)
