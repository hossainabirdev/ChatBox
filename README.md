![ChatBox — animated banner](assets/banner.gif)

# ChatBox

A real-time messaging PWA that brings together the best of WhatsApp, Messenger, Instagram and Snapchat — and adds what none of them have: 13 games inside your chats, Watch Together, and group games you can spectate live.

**Live demo:** https://chatbox01.pages.dev

## What's new in v174

- Login-logo wave restored — the logo ripple waves forever again, like the old app.
- Emoji panel now rises in with a gentle 180 ms fade.

## Why ChatBox?

Most chat apps do one thing: messages. ChatBox is built around a different idea — a chat app should be the place where you talk, call, play and watch together, without ever leaving the conversation.

It takes the messaging ideas people already love — WhatsApp's voice calls, voice notes and disappearing messages; Messenger's reactions, replies and in-chat games; Instagram's stories; Snapchat's view-once photos — and puts them in one app. Then it adds the things the big apps don't have.

## What makes ChatBox different

- **13 games inside your chats.** Chess, Ludo, Uno, Carrom, Quiz and more — play against real people or against offline bots. The bots always try to win and never cheat; they are beatable only through their per-match form, never through mercy.
- **Watch Together.** Watch any video link together with a friend — play, pause and seek stay in exact sync on both sides.
- **Group games with live spectating.** Challenge a group member or throw an open challenge; anyone else in the group can watch the match live.
- **Message yourself, play offline.** A self-chat with bot opponents for Uno and Ludo that works fully offline — no connection needed.
- **Everything in one HTML file.** The whole app — UI, games, calls, realtime — ships as a single `index.html`. No build step, no framework.
- **Engineered for the free tier.** Realtime-first with a bounded polling fallback, so the app stays fast and quiet on Supabase's free plan instead of hammering it.

## Features

### Messaging
- 1-to-1 chats and group chats with replies, reactions, message edits, unsend, forwards, pins and starred messages
- @mentions in groups, message search, per-chat wallpaper, themes and font size
- Read receipts with blue ticks, last seen, typing indicators and online presence
- Message yourself — a personal self-chat for notes, reminders and bot games

### Voice calls
- 1-to-1 voice calls (WebRTC) and group audio calls (Cloudflare Realtime SFU)
- Push notifications for incoming calls and messages when the app is closed
- Call history and missed-call notifications

### Groups & communities
- Groups with admins, member management, group info, polls and shared pins
- Communities that bundle related groups together
- Group polls with live results and a "who voted" view

### Games
Play inside any 1-to-1 or group chat — against real people or offline bots:

**Chess · Ludo · Uno · Carrom · Quiz · Snakes & Ladders · Tic Tac Toe · Rock Paper Scissors · Checkers · Connect 4 · Memory Match · Truth or Dare**

- Group games: directed and open challenges, 10-minute invite expiry, 15-minute no-presence auto-end, max 3 pending invites per group, live spectating for other members
- Solo games: play Uno and Ludo against 3 bots in your self-chat, fully offline
- Game results are posted to the chat as system messages

### Watch Together
- Watch any web video link together — play, pause and seek sync exactly on both sides
- The minimised player keeps playing with sound; if the other person goes offline, sync pauses and your video keeps playing

### Media & privacy
- Photos, videos, documents, audio and voice notes
- Stories, view-once photos and videos, and disappearing messages with a per-chat timer
- Hide messages on this device, per-chat mute, and a notification centre
- Birthday reminders and chat streaks

### Reliability & offline
- Offline message queue — messages sent without a connection go out when you are back online
- Cached first paint — the inbox renders instantly from cache, then syncs live
- Installable PWA with a service worker; updates apply after a full restart or via the Update button

## Tech stack

- **Frontend:** single-file PWA — HTML / CSS / JavaScript, no build step, no framework
- **Backend:** Supabase — Auth, Postgres, Realtime, Storage
- **Hosting:** Cloudflare Pages
- **Calls:** WebRTC (1-to-1) + Cloudflare Realtime SFU (group audio)

## Architecture

One static file (`index.html`) talks directly to Supabase from the browser.
Realtime channels push new messages, game moves, and presence; every table is
gated by Row Level Security, so a client can only read what it is allowed to
see. When Realtime degrades, the app falls back to a bounded poll (60 s
healthy / 5 s degraded) so chats keep working without hammering the free-tier
quota. The Supabase **anon key in `index.html` is public by design** — it is
scoped by RLS; real secrets (service_role, TURN, VAPID, Brevo, Realtime app
secret) live only in the Supabase / Cloudflare dashboards, never in this repo.

## Setup

```bash
git clone https://github.com/hossainabirdev/ChatBox.git
cd ChatBox
# serve statically — any static server works, e.g.:
npx serve .
# open http://localhost:3000
```

Backend (one-time, in your own Supabase project):

1. Create a Supabase project; note the project URL and anon key.
   The live app runs on project "ChatBox" (ref `dpohgpccqkbzazbbikwx`,
   Singapore region).
2. **v174 needs no new SQL.** If you are setting the backend up from scratch,
   run the **§0 check-first queries** in `supabase-v172.sql` and record the
   answers — then run one section at a time. Live status (20 Nov 2026,
   project "chatbox"): §0 done; §1-1a, §1-3a (adapted), §2 C-12 and §3 S-1
   already run and verified. §3 E-06 and §3 F11 are STOPPED and need a
   rework — do not run them as written. §1-1b, §1-3c, the `view_once_views`
   table and the `muted_chats` table must NOT be run.
3. Set the server secrets listed in `.env.example` — in the dashboards, not
   in the repo (see `DEPLOY_GUIDE.md`).
4. In `index.html`, replace the Supabase project URL / anon key with yours.

## Folder structure

```
.
├── index.html            # the whole app (v174)
├── sw.js                 # service worker — offline shell + push
├── manifest.json         # PWA manifest
├── logo.png  icon-*.png  # app icons
├── favicon.svg
├── chatbox-call-doodle-bg.jpg
├── _headers              # Cloudflare Pages headers
├── supabase-v172.sql     # backend migration (partially run live 20 Nov 2026 — A/B/C/F done, D/E need rework; v174 needs no new SQL)
├── assets/banner.gif     # README banner
├── README.md
├── DEPLOY_GUIDE.md       # Cloudflare deploy + GitHub push steps
├── GITHUB_UPDATE.md      # About fields to paste on GitHub (description / website / topics)
├── .env.example          # secret names only — never real values
└── LICENSE               # MIT
```

## License

MIT — see [LICENSE](LICENSE).
