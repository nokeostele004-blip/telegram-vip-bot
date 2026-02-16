import { createInvoice } from "./payment.js"
import { sendMessage } from "./utils.js"

export async function handleTelegram(request, env) {
  const update = await request.json()
  if (!update.message) return new Response("OK")

  const chatId = update.message.chat.id
  const text = update.message.text || ""

  if (text.startsWith("/start")) {
    await env.DB.prepare(
      "INSERT OR IGNORE INTO users (telegram_id, created_at) VALUES (?,?)"
    ).bind(chatId, Date.now()).run()

    return sendMessage(env, chatId, "Gunakan /subscribe vip1")
  }

  if (text.startsWith("/subscribe")) {
    const groupKey = text.split(" ")[1]
    const group = await env.DB.prepare(
      "SELECT * FROM groups WHERE key=?"
    ).bind(groupKey).first()

    if (!group)
      return sendMessage(env, chatId, "Grup tidak ditemukan")

    const packages = await env.DB.prepare(
      "SELECT * FROM packages WHERE group_id=?"
    ).bind(group.id).all()

    let msg = `Paket ${groupKey}:\n`
    packages.results.forEach(p => {
      msg += `${p.name} - Rp${p.price}\n`
    })

    return sendMessage(env, chatId, msg)
  }

  return new Response("OK")
}
