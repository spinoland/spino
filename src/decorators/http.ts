type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

export interface RouteDefinition {
  method: HttpMethod
  path: string
  handler: string
}

function httpMethod(method: HttpMethod, path: string) {
  return function (_target: unknown, context: ClassMethodDecoratorContext) {
    const routes = (context.metadata.routes as RouteDefinition[]) ?? []
    routes.push({ method, path, handler: context.name as string })
    context.metadata.routes = routes
  }
}

export const Get = (path: string) => httpMethod("GET", path)
export const Post = (path: string) => httpMethod("POST", path)
export const Put = (path: string) => httpMethod("PUT", path)
export const Delete = (path: string) => httpMethod("DELETE", path)
export const Patch = (path: string) => httpMethod("PATCH", path)
