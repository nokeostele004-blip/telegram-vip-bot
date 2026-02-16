import { handleTelegram } from "./telegram.js"
import { handlePaymentWebhook } from "./payment.js"
import { handleAdmin } from "./admin.js"
import { handleCron } from "./cron.js"

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname === "/webhook")
      return handleTelegram(request, env)

    if (url.pathname === "/callback")
      return handlePaymentWebhook(request, env)

    if (url.pathname === "/admin")
      return handleAdmin(request, env)

    return new Response("OK")
  },

  async scheduled(_, env) {
    return handleCron(env)
  }
}
