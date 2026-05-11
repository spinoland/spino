export const injectableMetadata = new WeakMap<object, object[]>()

export function Injectable(...deps: object[]) {
  return function (_target: object, _context: ClassDecoratorContext) {
    injectableMetadata.set(_target, deps)
  }
}
