import { sendInvite } from "./utils.js"

export async function createInvoice(env, data) {
  const res = await fetch("https://qris.pw/api/create-payment.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": env.QRIS_API_KEY,
      "X-API-Secret": env.QRIS_API_SECRET
    },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function handlePaymentWebhook(request, env) {
  const payload = await request.json()
  if (payload.status !== "paid")
    return new Response("OK")

  const invoice = await env.DB.prepare(
    "SELECT * FROM invoices WHERE transaction_id=?"
  ).bind(payload.transaction_id).first()

  if (!invoice)
    return new Response("Not found")

  await env.DB.prepare(
    "UPDATE invoices SET status='paid' WHERE id=?"
  ).bind(invoice.id).run()

  const membership = await env.DB.prepare(
    "SELECT * FROM memberships WHERE user_id=? AND group_id=?"
  ).bind(invoice.user_id, invoice.group_id).first()

  const now = Date.now()
  let base = now

  if (membership && membership.expire_at > now)
    base = membership.expire_at

  const pkg = await env.DB.prepare(
    "SELECT duration FROM packages WHERE id=?"
  ).bind(invoice.package_id).first()

  const newExpire = base + pkg.duration * 86400000

  if (membership) {
    await env.DB.prepare(
      "UPDATE memberships SET expire_at=? WHERE id=?"
    ).bind(newExpire, membership.id).run()
  } else {
    await env.DB.prepare(
      "INSERT INTO memberships (user_id, group_id, expire_at) VALUES (?,?,?)"
    ).bind(invoice.user_id, invoice.group_id, newExpire).run()
  }

  await sendInvite(env, invoice.user_id, invoice.group_id, pkg.duration)

  return new Response("OK")
}
