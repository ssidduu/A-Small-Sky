# A Small Sky ✦

A deep-space site to ask someone out. She's asked the question (the "No" button dims the sky and
eventually melts), picks a planet (the plan), picks a day on a calendar, and gets a
moonlit "It's a date" note. Her answers save automatically, and you read them on a private page.

```
index.html       the site she opens
admin.html       your private page: /admin.html
api/answer.js    saves answers (POST) and lists them for you (GET, needs your key)
```

## Personalise
In `index.html`, edit `CONFIG` near the top of the script (her name, your name, WhatsApp number).
The WhatsApp button only appears if saving fails, as a backup.
Or leave her name empty and put it in the link: `https://your-site.vercel.app/?to=Ananya`
Date ideas live in the `PLANETS` array.

## Deploy (about 5 minutes)
1. Push this folder to a GitHub repo.
2. vercel.com → Add New → Project → import the repo → Deploy. No build settings needed.
3. In the project: **Storage** → **Upstash for Redis** (free tier) → Create → connect it to this project.
   This adds the database URL and token as environment variables automatically.
4. **Settings → Environment Variables** → add `ADMIN_KEY` with any secret word only you know.
5. **Deployments** → Redeploy, so the new variables take effect.
6. Test once yourself, then open `/admin.html`, enter your key, and you'll see the answer.

What gets saved: when she taps Yes (with how many times she pressed No first), and her final plan
(plan, night, moon, time). No personal data beyond the name you put in the link.
