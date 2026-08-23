/*
  Discord通知の中継。

  以前は各ページのJavaScriptにwebhook URLを直書きしていたため、
  公開ページのソースから誰でも読める状態になっていた(2026-05-22〜2026-08-24)。
  実際に第三者に拾われ、依頼チャンネルが荒らされている。

  webhook URLはブラウザに渡してはいけない。ここで環境変数から読み、
  サーバー側からDiscordへ投げる。フロントは /api/notify を叩くだけにする。

  order/ と save/sabanomiso/ は JSON、intake/ は画像付きの multipart を送ってくる。
  中身を解釈せずそのまま素通しすることで、両方を1本で扱える。

  必要な環境変数: DISCORD_WEBHOOK_URL
*/

export const config = { runtime: "edge" };

/** 受け付ける送信元。ここに無いオリジンからは弾く */
const ALLOWED_ORIGINS = [
  "https://hexa-relation.com",
  "https://www.hexa-relation.com",
];

/** Discordの添付上限に合わせる(画像4枚を想定) */
const MAX_BODY_BYTES = 9 * 1024 * 1024;

/*
  同一IPからの連投を抑える。Edgeはインスタンスが分散するので取りこぼすが、
  素の状態(無制限)よりは遥かにマシなので入れておく。
  厳密な制限が必要になったらKVなどの外部ストアに移すこと。
*/
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.start > WINDOW_MS) {
    hits.set(ip, { start: now, count: 1 });
    if (hits.size > 5000) hits.clear();   // 際限なく太らせない
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_PER_WINDOW;
}

function cors(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function json(status, obj, origin) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...cors(origin) },
  });
}

export default async function handler(req) {
  const origin = req.headers.get("origin") || "";

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors(origin) });
  }
  if (req.method !== "POST") {
    return json(405, { error: "method not allowed" }, origin);
  }

  /*
    Originはブラウザが付けるヘッダなのでcurlからは自由に偽装できる。
    ここでの目的は「別サイトに埋め込まれたフォームから叩かれること」を防ぐことであって、
    直接叩く相手を止めることではない。それは上のレート制限側で受ける。
  */
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return json(403, { error: "forbidden origin" }, origin);
  }

  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (!webhook) {
    // URL自体は絶対に応答へ含めない
    console.error("DISCORD_WEBHOOK_URL が未設定");
    return json(500, { error: "not configured" }, origin);
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return json(429, { error: "too many requests" }, origin);
  }

  const body = await req.arrayBuffer();
  if (body.byteLength === 0) {
    return json(400, { error: "empty body" }, origin);
  }
  if (body.byteLength > MAX_BODY_BYTES) {
    return json(413, { error: "payload too large" }, origin);
  }

  /*
    Content-Typeはそのまま引き継ぐ。multipartはboundaryを含むため、
    ここを作り直すと画像添付が壊れる。
  */
  const contentType = req.headers.get("content-type");
  const headers = {};
  if (contentType) headers["content-type"] = contentType;

  let res;
  try {
    res = await fetch(webhook, { method: "POST", headers, body });
  } catch (err) {
    console.error("Discordへの送信に失敗:", err?.message);
    return json(502, { error: "upstream failed" }, origin);
  }

  if (!res.ok) {
    // Discordの応答本文にはwebhookの情報が含まれうるので、状態だけ返す
    console.error("Discord応答:", res.status);
    return json(502, { error: "upstream error", status: res.status }, origin);
  }

  return json(200, { ok: true }, origin);
}
