export const controllerRegistry = new Set<object>()

export function Controller(prefix: string) {
  return function (target: object, context: ClassDecoratorContext) {
    context.metadata.prefix = prefix
    controllerRegistry.add(target)
  }
}
