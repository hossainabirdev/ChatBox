# Deploy & push guide

## 1. Deploy to Cloudflare Pages (manual)

1. Zip the app files at the repo root — exactly these 11:
   `index.html`, `sw.js`, `manifest.json`, `favicon.svg`, `logo.png`,
   `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`,
   `chatbox-call-doodle-bg.jpg`, `_headers`, `README-v174.txt`
   (do **not** include `README.md`, `DEPLOY_GUIDE.md`,
   `.env.example`, `.gitignore`, `LICENSE`, `supabase-v172.sql`, or
   `assets/` — those are repo-only).
2. Cloudflare dashboard → Workers & Pages → the **chatbox01** Pages project →
   **Create deployment** → **Direct Upload** → upload the zip.
   (Live site: https://chatbox01.pages.dev — v174 runs on the new backend,
   Supabase project "ChatBox", ref `dpohgpccqkbzazbbikwx`, Singapore.)
3. Verify: open the site, Settings → About shows v174, and the share link
   shows https://chatbox01.pages.dev. Also check the CSP header names the new
   host: `curl -s -I https://chatbox01.pages.dev/ | grep -i content-security-policy`
   must show `dpohgpccqkbzazbbikwx` (the `_headers` in this pack names the new
   host — a v173 pack briefly shipped the old host and login failed with
   "Failed to fetch"; that was fixed in the CSP-fix pack and carried over here).

## 2. Push to GitHub

```bash
git add .
git commit -m "ChatBox v174"
git push
```

First-time setup (if the repo is not cloned yet):

```bash
git clone https://github.com/hossainabirdev/ChatBox.git
cd ChatBox
```

After pushing, update the repo About fields on GitHub (repo page → ⚙️ About).
Description — pick one (option 1 recommended):
1. "Not just a chat app — a whole universe in one HTML file: real-time chats, voice calls, stories, polls, Watch Together, and 13 games you can play right inside your conversations."
2. "Chat, call, play — a real-time messaging PWA with 13 games hidden inside your chats, Watch Together, stories and voice calls, all packed into a single HTML file."
3. "A chat app with a different vibe: message, call, play 13 games, watch videos together, share stories — everything in one HTML file, no build step, no framework."
Website: https://chatbox01.pages.dev
Topics: chat-app, messaging, realtime, supabase, pwa, webrtc, javascript, cloudflare-pages
Pin the repo on your profile.

## 3. Where the real secrets go (never in the repo)

| Secret | Set it in |
|---|---|
| Supabase `service_role` key | Supabase dashboard → Project Settings → API (server use only) |
| `TURN_SHARED_SECRET` | Supabase dashboard → Edge Functions → Secrets |
| `VAPID_PRIVATE_KEY` | Supabase dashboard → Edge Functions → Secrets |
| `BREVO_API_KEY` | Supabase dashboard → Edge Functions → Secrets |
| Cloudflare Realtime app id + secret | Cloudflare dashboard → Realtime; secret also in Supabase Edge Function secrets |
| `CLEANUP_SECRET` | Supabase dashboard → Edge Functions → Secrets |

Real secrets **never** go in the repo, in any file, in any commit. If one
ever lands in git history, rotate it immediately — deleting the file does not
unleak it. `.env` is git-ignored; only `.env.example` (placeholders) is
committed.

## 4. Backend first-run checklist

**v174 needs no new SQL.** Live status (20 Nov 2026, project "chatbox"):
the `§0` checks are done and §1-1a, §1-3a (adapted), §2 C-12 and §3 S-1 are
already run and verified live. Do NOT run §3 E-06 or §3 F11 as written
(both stopped, rework owed), and do NOT run §1-1b, §1-3c, the
`view_once_views` table or the `muted_chats` table.

1. Run the `§0` checks in `supabase-v172.sql` before any section.
2. Confirm `group_messages.forwarded` exists (a missing column breaks group
   opens) and `message_meta` is in the Realtime publication — both confirmed
   live on 20 Nov 2026.
3. Deploy the Edge Functions the app calls (`send-push`, `login-by-email`,
   `request-recovery-code`, `verify-and-reset`, `send-welcome`,
   `delete-view-once`, `cleanup-expired-media`, `link-preview`,
   `group-call-token`).
