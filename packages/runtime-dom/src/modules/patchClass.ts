export const patchClass = (el, className) => {
  if(className !== null) {
    el.className = className
  } else {
    el.removeAttribute('class')
  }
}