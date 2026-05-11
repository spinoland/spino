import { injectableMetadata } from "../decorators/injectable.ts"

export type Token<T = unknown> = abstract new (...args: never) => T

export class Container {
  #singletons = new Map<object, unknown>()
  #bindings = new Map<object, object>()

  bind<T>(abstract: Token<T>, concrete: Token<T>): void {
    this.#bindings.set(abstract, concrete)
  }

  resolve<T>(token: Token<T>): T {
    return this.#resolve(token, new Set())
  }

  #resolve<T>(token: Token<T>, resolving: Set<object>): T {
    const concrete = (this.#bindings.get(token) ?? token) as Token<T>

    if (this.#singletons.has(concrete)) {
      return this.#singletons.get(concrete) as T
    }

    if (resolving.has(concrete)) {
      throw new Error(`Circular dependency detected: ${(concrete as { name: string }).name}`)
    }

    resolving.add(concrete)

    const deps = (injectableMetadata.get(concrete) ?? []).map((dep) =>
      this.#resolve(dep as Token, resolving)
    )

    const instance = new (concrete as new (...args: unknown[]) => T)(...deps)
    this.#singletons.set(concrete, instance)
    return instance
  }
}
