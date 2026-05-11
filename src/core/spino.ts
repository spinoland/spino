import { Hono } from "hono"
import { Container } from "./container.ts"
import { mountControllers } from "./router.ts"

interface BootOptions {
  port?: number
  controllers?: string
}

export class Spino {
  readonly container = new Container()
  readonly #app = new Hono()

  async boot({ port = 8000, controllers }: BootOptions = {}) {
    if (controllers) {
      await this.#loadControllers(controllers)
    }
    mountControllers(this.#app, this.container)
    Deno.serve({ port }, this.#app.fetch)
  }

  async #loadControllers(dir: string) {
    for await (const entry of this.#walk(dir)) {
      if (entry.endsWith(".ts") || entry.endsWith(".js")) {
        await import(entry)
      }
    }
  }

  async *#walk(dir: string): AsyncGenerator<string> {
    const abs = new URL(dir, `file://${Deno.cwd()}/`).href
    for await (const entry of Deno.readDir(new URL(abs))) {
      const path = `${abs}/${entry.name}`
      if (entry.isDirectory) {
        yield* this.#walk(path)
      } else {
        yield path
      }
    }
  }
}
