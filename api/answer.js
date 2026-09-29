// POST /api/answer          → saves one answer event (called by the site)
// GET  /api/answer?key=...  → lists saved answers (only with your ADMIN_KEY)
//
// Storage: Upstash Redis via its REST API (add "Upstash for Redis" from the Vercel Marketplace).
// Works with either env var naming the integration injects.

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const ADMIN_KEY = process.env.ADMIN_KEY;
const LIST = "small-sky:answers";

async function redis(...command) {
  const r = await fetch(URL_, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
  if (!r.ok) throw new Error(`redis ${r.status}`);
  return (await r.json()).result;
}

const clean = (v, n = 120) => (v == null ? null : String(v).slice(0, n));

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (!URL_ || !TOKEN) return res.status(500).json({ error: "Database not connected. Add Upstash Redis in Vercel → Storage." });

  try {
    if (req.method === "POST") {
      const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      if (!["yes", "ticket"].includes(b.stage)) return res.status(400).json({ error: "bad stage" });
      const entry = {
        at: new Date().toISOString(),
        session: clean(b.session, 64),
        stage: b.stage,
        her: clean(b.her, 40),
        plan: clean(b.plan),
        night: clean(b.night),
        moon: clean(b.moon, 40),
        time: clean(b.time),
        noCount: Math.max(0, Math.min(99, Number(b.noCount) || 0)),
        tz: clean(b.tz, 60),
      };
      await redis("LPUSH", LIST, JSON.stringify(entry));
      await redis("LTRIM", LIST, 0, 499); // keep the latest 500 events
      return res.status(200).json({ ok: true });
    }

    if (req.method === "GET") {
      if (!ADMIN_KEY || req.query.key !== ADMIN_KEY) return res.status(401).json({ error: "wrong key" });
      const rows = (await redis("LRANGE", LIST, 0, 499)).map((s) => JSON.parse(s));
      return res.status(200).json({ answers: rows });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: "could not reach the database" });
  }
}
