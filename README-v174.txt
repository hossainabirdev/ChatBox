ChatBox v174 — login-logo wave restored + emoji panel entry (base v173 + CSP fix)
Release: 21 November 2026, 09:51 (Asia/Dhaka) — sw chatbox-v174
NO SQL ships with this version (v174 needs no new SQL — see §6).
Call block byte-identical (md5 63e54beeafa890f9383ad9195ab78c61). No call code touched at all (user rule, 21 Nov 00:59).
Bots untouched. No behaviour, data-flow, network-call or logic changes — one bug fix + one polish rule only.
Base = v173-csp-fix (index md5 61aaab7fad3d3f8ad72cc98830e3c321); _headers unchanged from the CSP fix (new host 4x, old host 0x).

================================================================
RELEASE FACTS
================================================================
- index.html: md5 1f073773c60897b420678ba2a359a8b5, 40,096 lines (+11 vs base), 2,596,052 bytes (+769)
- sw.js: md5 d92653238cc4975a7f1bf9b807b3012f, CACHE_NAME chatbox-v174
- supabase-v174.sql: NONE — v174 needs no new SQL. The v172 SQL live-status note still stands
  (A, B, C, F run live 20 Nov 2026; D + E STOPPED, rework deferred by the user — do not run as written).
- Version strings: __CHATBOX_VERSION__ = 'v174', 0 stale v173 refs in version strings.
  (Historical v173-* identifiers — the v173 polish block, v173MsgIn, v173TypingFadeOut, etc. —
  are live CSS/JS names and are kept deliberately, exactly as v173 kept v152/v105/v106/v49 names.
  Only version strings were bumped.)
- QR/share fix survives: chatbox01.pages.dev x3, chatbox-41j x0.
- _headers: CSP names the new Supabase host (dpohgpccqkbzazbbikwx) 4x, old host 0x — the v173
  lesson is applied: _headers was checked, not just index.html.

================================================================
§1 WHAT CHANGED — the fix (WHY + WHAT) and the one upgrade
================================================================
FEEL BAR (user, 21 Nov 01:02, still the bar): smooth, fast load, realistic — must FEEL like a
premium app. 60fps transform/opacity-only motion, no jank/flicker/layout shift, nothing cartoonish.

FIX — login-logo wave restored (the user-reported regression):
- WHY: on the login page the logo's ripple ring ("wave") played once and stopped, while the
  old app (v172) waves forever. The v173 final check (21 Nov 09:46, hidden_files/v174_audit/
  AUDIT.md) proved the cause by CSS evidence: v173 line 18747, inside the v173 polish block,
  `body #auth .logo::after{animation:v105LogoPulse 2.6s ease-out 1}` overrode the infinite base
  rule at line 2126 (`animation:v105LogoPulse 2.6s ease-out infinite`) — higher specificity
  (1,1,2) vs (1,1,1), and later in the file — so the ripple ran one 2.6s play and stopped.
  The keyframes (line 2127) and the splash logo (line 2201, still infinite) were untouched.
- WHAT: the override rule AND its comment line are deleted (replaced by one v174 FIX comment
  marking the deletion, so nobody re-adds it). The base rule at line 2126 now governs again —
  the login ripple is infinite, byte-identical behaviour to v172. Splash logo untouched.
- NOTE: the auth logo itself already pops in on login paint (line 14275, `animation:pop .35s`),
  and its two check-draw ticks still draw at .5s/.68s — none of that was touched.

U1 — emoji panel entry (the one upgrade):
- WHY: the emoji panel (#emojiPanel) appeared instantly on every open, while every other
  overlay — menus (v102MenuIn), modal sheets + backdrop (v89), toasts (v152), install bar
  (v84BarIn), story viewer (v49Fade) — already has an entry. It was the last un-animated
  overlay in the app.
- WHAT: new <style id="v174-polish"> block (12 lines) after the v173 polish block:
  `#emojiPanel.show{animation:v174EmojiIn .18s var(--v173-ease) both}` +
  `@keyframes v174EmojiIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}`.
  Reuses the v173 motion scale (180ms, cubic-bezier(.2,0,0,1)). Transform/opacity only.
  User-triggered toggle only (toggleEmoji) — the panel is built once and toggled, so there
  is no re-render replay risk.

================================================================
§2 FINAL CHECK — v174 audit summary (full report: hidden_files/v174_audit/AUDIT.md)
================================================================
Live new app (chatbox01.pages.dev) serves exactly the v173-csp-fix source (index md5
61aaab7f..., sw.js + manifest md5s match local; CSP new host 4x / old host 0x). Old app
(chatbox-41j.pages.dev) untouched, still v172 (md5 44c9fa3e...). All 9 edge-function
OPTIONS preflights return the right status (5 auth functions 200 + exact new origin;
send-push + link-preview 200 + *; get-call-ice-servers 200 + exact origin — stricter than
*, functionally correct; cleanup-expired-media 401 by design). Diff v172 -> v173 fully
accounted for (189 lines: host/key/URL swaps, version bump, polish block, B1–B6 fixes,
two intended cuts) — NO regression found beyond the logo cut. _headers correct in every
live/fixed copy; two STALE copies flagged — plain files/chatbox-supabase-v173/ and repo
pack r5 (files/chatbox-github-repo-v173/) still carry old-host _headers (old=4). NEVER
deploy those; deploy only the csp-fix folder / r6 pack / this v174 build.
Known open item (unchanged): cleanup-expired-media 401 with no CORS headers; its
browser-called delete-one mode would still be preflight-blocked — fix needs the user's
approval.

================================================================
§3 CONSIDERED, NOT DONE (upgrades I checked and left out, with WHY)
================================================================
- Auth-logo scale-in on login paint: ALREADY EXISTS (line 14275, pop .35s) — nothing to add.
- Toast entry: ALREADY EXISTS (v152 — slide + fade, reflow-restart on repeat).
- Modal backdrop fade: ALREADY EXISTS (v89ModalIn .22s opacity fade on .modal).
- Menu entry: ALREADY EXISTS (v102MenuIn .16s on .wa-menu).
- Install-bar entry: ALREADY EXISTS (v84BarIn .38s).
- Story-viewer entry: ALREADY EXISTS (v49Fade .18s).
- FAB entry animation: SKIPPED — the FAB is display:none in some layouts (lines 1459, 1702),
  so an entry animation could replay when layout switches. Hover scale already exists.
- Empty-inbox fade (".empty" state): SKIPPED — the empty state is re-rendered into the list
  on every inbox rebuild, so a fade would replay while the inbox stays empty.
- Login-failure shake on the card: SKIPPED — needs JS in the auth error path (class toggle +
  cleanup) for a cosmetic effect; not worth the risk in login code.
- Message-image fade-in: SKIPPED — a blanket rule would touch view-once / disappearing /
  sticker images; needs careful scoping, not a one-liner.
- Presence "Online" text fade on flip: SKIPPED — needs JS (class toggle on text change) in
  presence code; the dot scale-in (P3.1) already marks the flip.
- Theme (dark/light) switch transition: SKIPPED — colour transitions are outside the
  transform/opacity-only bound and would flash the whole app.
- Pull-to-refresh: NOT DONE — verified absent; a new feature, not polish, needs the user's word.
- Game-sheet / game-UI polish: NOT TOUCHED — game + bot code is out of scope for this version.
- Call screen / call UI / call CSS: NOT TOUCHED — user rule (21 Nov 00:59). All 14 v173
  call items stay skipped.

================================================================
§4 SKIPPED — call-related (user rule 21 Nov 00:59)
================================================================
No call code, call UI, call CSS, signalling, ICE, or call-adjacent shared rule was touched.
The v174 polish block contains zero call identifiers and zero bare-button selectors.
Call block md5 63e54beeafa890f9383ad9195ab78c61 — byte-identical to v172/v173.

================================================================
§5 VERIFICATION RESULTS
================================================================
Independent verification (separate subagent, full report in hidden_files/v174_verify/
VERIFY.md). All checks run on the final files (index md5 1f073773...); the only change
after verification was this §5 table itself (README-only), after which the ZIP was
rebuilt and the extraction re-verified (see note at the end of this section).
| # | Check | Result | Numbers |
|---|---|---|---|
| 1 | Call block invariant (canonical inner-content md5) | PASS | 63e54beeafa890f9383ad9195ab78c61 — exact match, 70,893 chars, byte-identical to base |
| 2 | node --check all inline scripts + sw.js | PASS | 46 blocks, 0 errors (same as v173 baseline); sw.js OK (node v24.22.1) |
| 3 | Expose audit + emoji rules + no new function | PASS | 582 onclick, 345 names, DEAD: 0; expose list 141 names, identical to v173; v174EmojiIn present; function declarations 1558 in both — added 0, removed 0 |
| 4 | ZIP 11 files + extraction md5s | PASS | Exactly 11 files at root; extracted index md5 1f073773... = disk, sw.js d9265323... = disk, _headers c94820b1... = disk |
| 5 | _headers CSP host counts | PASS | New host 4x, old host 0x — folder copy and extracted ZIP copy alike |
| 6 | Version strings + md5 | PASS | v174, release 21 Nov 2026, 09:51 (line 39114), sw.js cache chatbox-v174, stale v173 version refs 0; 117 v173 occurrences are live identifiers, intentionally kept |
| 7 | QR/share fix preserved | PASS | chatbox01.pages.dev x3, chatbox-41j x0 |
| 8 | Diff review (3 hunks, 17 lines) | PASS | Only the logo-fix deletion, the 12-line v174-polish block, and the version line; no hunk in call block or call CSS; 0 network/bot/data-flow changes; polish block 0 call identifiers, 0 bare-button selectors |
| 9 | Logo-fix lines | PASS | Override gone (0 occurrences of `ease-out 1}`); base 2126 infinite, keyframes 2127, splash 2201 infinite — all byte-identical; auth-logo pop-in + check-draw ticks present |
| 10 | Implementation completeness | PASS | Every CHANGES.md item present; nothing claimed but missing; all non-index/sw files byte-identical to base; sw.js diff = exactly the 2 claimed lines |
Note: after this table was added (README-only change), the ZIP was rebuilt from INSIDE
the folder with the same explicit 11-file list and the extraction re-verified by the
coordinator (extracted index md5 1f073773... = disk, sw.js d9265323... = disk,
_headers c94820b1... = disk). The final ZIP md5 is recorded in the delivery report
(CHANGES.md §6), not here — a README cannot carry its own ZIP's md5.

================================================================
§6 SQL
================================================================
v174 needs NO new SQL. The v172 SQL live-status note still stands: §0, §1-1a,
§1-3a (adapted), §2 C-12 and §3 S-1 run live 20 Nov 2026 and verified; §3 E-06
and §3 F11 STOPPED and need a rework — do not run them as written; §1-1b,
§1-3c, the view_once_views table and the muted_chats table must NOT be run.
No Supabase changes were made for v174.

================================================================
§7 WHAT IS NOT VERIFIED (live browser — owed after deploy)
================================================================
Login-logo ripple playing forever in a real browser (proven by CSS evidence only, not
watched); splash -> login -> inbox first paint / CLS; emoji-panel entry live; typing fade;
presence-flip dot scale-in; tab-switch fade timing; modal/tab/toast timings; update-apply
flow (status text only, do NOT apply the update in the test); reduced-motion pass;
call-screen smoke check (open only, nothing modified). Mobile-width (320/390 px)
screenshots light + dark were not captured in this build (no live browser in this
session) — the user's own phone is the real mobile test.

================================================================
§8 DEPLOY NOTES
================================================================
- ZIP: chatbox-supabase-v174-2026-11-21.zip, exactly 11 files at ZIP root
  (index.html, sw.js, manifest.json, favicon.svg, logo.png, icon-192.png,
  icon-512.png, icon-maskable-512.png, chatbox-call-doodle-bg.jpg, _headers,
  README-v174.txt). Built from INSIDE the folder; extraction-verified.
- Deploy: Cloudflare Pages -> chatbox01 project -> Create deployment -> upload
  the ZIP (user deploys — Cloudflare work is his). After deploy, PWA update
  applies after full close + reopen or via the Update button; never during a call.
- The new backend is the new Supabase project (ref dpohgpccqkbzazbbikwx,
  Singapore); the app talks to it via the keys already in index.html.
- v173 + CSP fix is superseded by v174. Do not deploy v173 again. NEVER deploy
  the plain files/chatbox-supabase-v173/ folder (stale _headers, old host).
