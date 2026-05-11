import { assertEquals, assertInstanceOf, assertStrictEquals, assertThrows } from "jsr:@std/assert"
import { Container } from "../src/core/container.ts"
import { injectableMetadata } from "../src/decorators/injectable.ts"
import { Injectable } from "../src/decorators/injectable.ts"

Deno.test("Container", async (t) => {
  await t.step("resolve instantiates class", () => {
    @Injectable()
    class Foo {}

    const container = new Container()
    assertInstanceOf(container.resolve(Foo), Foo)
  })

  await t.step("resolve returns same singleton", () => {
    @Injectable()
    class Foo {}

    const container = new Container()
    assertStrictEquals(container.resolve(Foo), container.resolve(Foo))
  })

  await t.step("resolve injects dependencies recursively", () => {
    @Injectable()
    class Logger {}

    @Injectable(Logger)
    class UserService {
      constructor(public logger: Logger) {}
    }

    const container = new Container()
    const service = container.resolve(UserService)

    assertInstanceOf(service, UserService)
    assertInstanceOf(service.logger, Logger)
  })

  await t.step("bind replaces implementation", () => {
    class AbstractStorage {}
    class MemoryStorage extends AbstractStorage {}

    @Injectable()
    class MemoryStorageConcrete extends MemoryStorage {}

    const container = new Container()
    container.bind(AbstractStorage, MemoryStorageConcrete)

    assertInstanceOf(container.resolve(AbstractStorage), MemoryStorageConcrete)
  })

  await t.step("resolve throws on circular dependency", () => {
    class A {}
    class B {}

    injectableMetadata.set(A, [B])
    injectableMetadata.set(B, [A])

    const container = new Container()
    assertThrows(
      () => container.resolve(A),
      Error,
      "Circular dependency detected: A",
    )
  })

  await t.step("two containers are isolated", () => {
    @Injectable()
    class Foo {}

    const a = new Container()
    const b = new Container()

    const instanceA = a.resolve(Foo)
    const instanceB = b.resolve(Foo)

    assertEquals(instanceA instanceof Foo, true)
    assertEquals(instanceB instanceof Foo, true)
    assertEquals(instanceA === instanceB, false)
  })
})
