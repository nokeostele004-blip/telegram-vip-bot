export async function handleCron(env) {
  const now = Date.now()

  const expired = await env.DB.prepare(
    "SELECT * FROM memberships WHERE expire_at < ?"
  ).bind(now).all()

  for (const m of expired.results) {
    const group = await env.DB.prepare(
      "SELECT chat_id FROM groups WHERE id=?"
    ).bind(m.group_id).first()

    const user = await env.DB.prepare(
      "SELECT telegram_id FROM users WHERE id=?"
    ).bind(m.user_id).first()

    await fetch(
      `https://api.telegram.org/bot${env.BOT_TOKEN}/banChatMember`,
      {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          chat_id: group.chat_id,
          user_id: user.telegram_id
        })
      }
    )

    await env.DB.prepare(
      "DELETE FROM memberships WHERE id=?"
    ).bind(m.id).run()
  }
}
