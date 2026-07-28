import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidContact = process.env.VAPID_CONTACT_EMAIL || "admin@agoro.app";

export async function POST(request) {
  if (!supabaseUrl || !serviceRoleKey || !vapidPublicKey || !vapidPrivateKey) {
    // Push isn't configured yet (missing env vars) — no-op rather than error,
    // so posting a reply never breaks just because notifications aren't set up.
    return Response.json({ sent: 0, skipped: "push not configured" });
  }

  const { threadId, threadTitle, replyAuthor, replyText } = await request.json();
  if (!threadId) {
    return Response.json({ error: "threadId is required" }, { status: 400 });
  }

  webpush.setVapidDetails(`mailto:${vapidContact}`, vapidPublicKey, vapidPrivateKey);
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("thread_id", threadId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  if (!subscriptions || subscriptions.length === 0) {
    return Response.json({ sent: 0 });
  }

  const payload = JSON.stringify({
    title: `New reply on "${threadTitle || "your question"}"`,
    body: replyAuthor ? `${replyAuthor}: ${replyText || ""}`.slice(0, 150) : (replyText || "").slice(0, 150),
    url: "/",
  });

  const staleIds = [];
  let sent = 0;
  await Promise.all(
    subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      };
      try {
        await webpush.sendNotification(pushSubscription, payload);
        sent += 1;
      } catch (err) {
        // 404/410 means the subscription is dead (browser data cleared,
        // permission revoked, etc.) — clean it up so we stop trying.
        if (err && (err.statusCode === 404 || err.statusCode === 410)) {
          staleIds.push(sub.id);
        }
      }
    })
  );

  if (staleIds.length > 0) {
    await supabase.from("push_subscriptions").delete().in("id", staleIds);
  }

  return Response.json({ sent, staleRemoved: staleIds.length });
}
