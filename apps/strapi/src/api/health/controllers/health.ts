export default {
  async check(ctx) {
    ctx.status = 200
    ctx.body = { status: "ok" }
  },
}

