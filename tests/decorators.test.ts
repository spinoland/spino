import { assert, assertEquals, assertInstanceOf } from "jsr:@std/assert"
import { injectableMetadata, Injectable } from "../src/decorators/injectable.ts"
import { Controller, controllerRegistry } from "../src/decorators/controller.ts"
import { Get, Post, Delete, Patch, Put } from "../src/decorators/http.ts"

Deno.test("@Injectable", async (t) => {
  await t.step("registers class without dependencies", () => {
    @Injectable()
    class Foo {}

    assertEquals(injectableMetadata.get(Foo), [])
  })

  await t.step("registers dependencies in order", () => {
    @Injectable()
    class DepA {}

    @Injectable()
    class DepB {}

    @Injectable(DepA, DepB)
    class Foo {}

    assertEquals(injectableMetadata.get(Foo), [DepA, DepB])
  })
})

Deno.test("@Controller", async (t) => {
  await t.step("registers prefix in Symbol.metadata", () => {
    @Controller("/users")
    class UserController {}

    assertEquals(UserController[Symbol.metadata]?.prefix, "/users")
  })

  await t.step("adds class to global registry", () => {
    controllerRegistry.clear()

    @Controller("/posts")
    class PostController {}

    assert(controllerRegistry.has(PostController))
  })
})

Deno.test("HTTP decorators", async (t) => {
  await t.step("@Get registers route", () => {
    class Ctrl {
      @Get("/")
      index() {}
    }

    const routes = Ctrl[Symbol.metadata]?.routes as { method: string; path: string; handler: string }[]
    assertEquals(routes.length, 1)
    assertEquals(routes[0], { method: "GET", path: "/", handler: "index" })
  })

  await t.step("multiple decorators on same controller", () => {
    class Ctrl {
      @Get("/")
      index() {}

      @Post("/")
      create() {}

      @Put("/:id")
      update() {}

      @Patch("/:id")
      patch() {}

      @Delete("/:id")
      remove() {}
    }

    const routes = Ctrl[Symbol.metadata]?.routes as { method: string }[]
    const methods = routes.map((r) => r.method)
    assertEquals(methods, ["GET", "POST", "PUT", "PATCH", "DELETE"])
  })
})
