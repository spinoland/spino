import { type Context, type Handler, Hono, type Next } from "hono"
import { controllerRegistry } from "../decorators/controller.ts"
import type { RouteDefinition } from "../decorators/http.ts"
import { Container, type Token } from "./container.ts"

type ControllerInstance = Record<string, (c: Context, next: Next) => unknown>

export function mountControllers(app: Hono, container: Container) {
  for (const ctor of controllerRegistry) {
    const meta = (ctor as { [Symbol.metadata]?: DecoratorMetadata })[Symbol.metadata]
    if (!meta) continue

    const prefix = (meta.prefix as string) ?? ""
    const routes = (meta.routes as RouteDefinition[]) ?? []
    const instance = container.resolve(ctor as Token<ControllerInstance>)

    for (const route of routes) {
      const path = prefix + route.path
      app[route.method.toLowerCase() as Lowercase<typeof route.method>](
        path,
        ((c, next) => instance[route.handler].call(instance, c, next)) as Handler,
      )
    }
  }
}
