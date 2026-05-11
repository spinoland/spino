import { Hono } from "hono"
import { assertEquals } from "jsr:@std/assert"
import { Container } from "../src/core/container.ts"
import { mountControllers } from "../src/core/router.ts"
import { Controller, controllerRegistry } from "../src/decorators/controller.ts"
import { Get, Post } from "../src/decorators/http.ts"
import { Injectable } from "../src/decorators/injectable.ts"

Deno.test("mountControllers", async (t) => {
  await t.step("mounts routes in Hono", async () => {
    controllerRegistry.clear()

    @Injectable()
    @Controller("/hello")
    class _HelloController {
      @Get("/")
      index(c: { json: (v: unknown) => unknown }) {
        return c.json({ ok: true })
      }
    }

    const app = new Hono()
    const container = new Container()
    mountControllers(app, container)

    const res = await app.request("/hello/")
    assertEquals(res.status, 200)
    assertEquals(await res.json(), { ok: true })
  })

  await t.step("prefixes routes with controller path", async () => {
    controllerRegistry.clear()

    @Injectable()
    @Controller("/api/v1")
    class _ApiController {
      @Get("/status")
      status(c: { json: (v: unknown) => unknown }) {
        return c.json({ version: 1 })
      }
    }

    const app = new Hono()
    const container = new Container()
    mountControllers(app, container)

    const res = await app.request("/api/v1/status")
    assertEquals(res.status, 200)
    assertEquals(await res.json(), { version: 1 })
  })

  await t.step("injects dependencies into controller", async () => {
    controllerRegistry.clear()

    @Injectable()
    class GreetService {
      greet(name: string) {
        return `Hello, ${name}!`
      }
    }

    @Injectable(GreetService)
    @Controller("/greet")
    class _GreetController {
      constructor(private greetService: GreetService) {}

      @Get("/:name")
      greet(c: {
        req: { param: (k: string) => string }
        json: (v: unknown) => unknown
      }) {
        return c.json({
          message: this.greetService.greet(c.req.param("name")),
        })
      }
    }

    const app = new Hono()
    const container = new Container()
    mountControllers(app, container)

    const res = await app.request("/greet/spino")
    assertEquals(res.status, 200)
    assertEquals(await res.json(), { message: "Hello, spino!" })
  })

  await t.step("POST route works", async () => {
    controllerRegistry.clear()

    @Injectable()
    @Controller("/items")
    class _ItemController {
      @Post("/")
      create(c: { json: (v: unknown, status: number) => unknown }) {
        return c.json({ created: true }, 201)
      }
    }

    const app = new Hono()
    const container = new Container()
    mountControllers(app, container)

    const res = await app.request("/items/", { method: "POST" })
    assertEquals(res.status, 201)
    assertEquals(await res.json(), { created: true })
  })
})
