CSP FIX — 21 November 2026, 08:45 (same app code as v173, version unchanged)
Fix: _headers Content-Security-Policy still listed the OLD Supabase host (qqagwtgcnzqdcoxdhjsi) in img-src / media-src / connect-src (4 places). The browser blocked every fetch to the NEW host (dpohgpccqkbzazbbikwx) — login failed with 'Failed to fetch' (console: 'violates the following Content Security Policy directive: connect-src'). The v173 build had regressed the _headers fix that Phase B had done correctly. This build replaces the old host with the new host in _headers only; index.html is byte-identical to v173 (md5 61aaab7fad3d3f8ad72cc98830e3c321). Redeploy this ZIP to chatbox01.pages.dev (Cloudflare Pages, Direct Upload, same as before). After deploy, verify: curl -I https://chatbox01.pages.dev/ shows the new host in content-security-policy, then log in.

ChatBox v173 — polish-only: animated load, refresh, realtime status transitions, smooth + premium feel (base v172 + QR/share fix)
Release: 21 November 2026, 01:23 (Asia/Dhaka) — sw chatbox-v173
NO SQL ships with this version (v173 needs no new SQL — see §6).
Call block byte-identical (md5 63e54beeafa890f9383ad9195ab78c61). No call code touched at all (user rule, 21 Nov 00:59).
Bots untouched. No behaviour, data-flow, network-call or logic changes — polish only.
Base v172 + QR/share fix (index md5 1634536a33c3f8cb3f7572a253f07be3, chatbox01.pages.dev x3, chatbox-41j x0).

================================================================
RELEASE FACTS
================================================================
- index.html: md5 61aaab7fad3d3f8ad72cc98830e3c321, 40,085 lines (+87 vs base), 2,595,283 bytes
- sw.js: md5 e2032c586e0d92dae4f45c49581c925e, CACHE_NAME chatbox-v173
- supabase-v173.sql: NONE — v173 needs no new SQL. The v172 SQL live-status note still stands
  (A, B, C, F run live 20 Nov 2026; D + E STOPPED, rework deferred by the user — do not run as written).
- Version strings: __CHATBOX_VERSION__ = 'v173', 0 stale v172 refs in version strings.
- QR/share fix survives: chatbox01.pages.dev x3, chatbox-41j x0.
- Note on the index md5: the verifier recorded 38fb3e82e8d4639e57ed1c2150cfb731 on the
  pre-packaging file; the only change after verification was the release-date string
  (01:15 -> 01:23, actual finish time), giving the md5 above. Call block, node --check,
  counts and version strings were re-verified after that one-line change (see §5).

================================================================
§1 WHAT CHANGED — polish items (WHAT + WHY for every item)
================================================================
FEEL BAR (user, 21 Nov 01:02): smooth, fast load, realistic — must FEEL like a premium
app. Every item below was judged against it: 60fps transform/opacity-only motion,
no jank/flicker/layout shift, first paint still instant, natural WhatsApp/Instagram-like
ease-outs, nothing cartoonish or bouncy, one consistent timing scale everywhere.

Shared motion scale (all items use it):
- WHAT: one new <style id="v173-polish"> block (79 lines, 5,122 bytes) after the L18673
  <style> block: --v173-dur-fast:120ms, --v173-dur-med:180ms, --v173-dur-slow:250ms,
  --v173-ease:cubic-bezier(.2,0,0,1), --v173-ease-soft:cubic-bezier(.22,1,.36,1).
  WHY: durations/easings were scattered (.12–.4s, three different curves); one scale
  makes every transition feel like the same app. Existing rules were NOT rewritten.
  All new motion is transform/opacity-only (one background-only exception, P2.3, by
  design). All new animation is plain CSS on classes — no inline JS-set transitions —
  so the existing prefers-reduced-motion global kills cover it automatically.

Area 1 — Animated load:
- P1.1 Splash exit scale — WHAT: #splash gains transition opacity .3s + transform .3s;
  #splash.v106-out gains transform scale(.985). WHY: the hide was already an opacity
  fade; a 1.5% scale whisper makes the exit read as one continuous motion instead of
  a flat dim. No JS change (hideSplash() already adds v106-out; the 340 ms timeout
  still covers the 300 ms transition).
- P1.2 App fade trim — WHAT: #app animation .4s -> .25s. WHY: 400 ms exceeds the
  120–250 ms feel-bar range for a UI reveal; 250 ms keeps the reveal perceptible
  but brisk.
- P1.3 Splash logo scale-in — WHAT: #splash .splash-logo animation v173LogoIn .25s
  (scale .94 -> 1, opacity 0 -> 1). WHY: the logo previously just appeared while
  only the ticks drew in; a gentle scale-in gives the first paint a finished feel
  without touching the tick draws, letter rise, or dots.
- P1.4 Login card trim — WHAT: #auth .card animation .4s with .35s delay -> .25s
  with .18s delay (settle 750 ms -> 430 ms). WHY: the card was the slowest-feeling
  part of the login reveal; same 8 px rise, just inside the feel-bar range.

Area 2 — Refresh:
- P2.1 Refresh-button completion pop — WHAT: in v44ManualRefresh() finally, after
  removing v102-spinning, the button gains class v173-done (scale .92 -> 1.06 -> 1,
  .25s), removed after 260 ms. WHY: the button already spun + dimmed during refresh,
  but completion had no signal except the toast; one subtle pop closes the feedback
  loop. Spin, opacity/pointer-events handling and the re-entrancy guard untouched.
- P2.2 Skeleton -> list crossfade — WHAT: in renderChats(), after el.innerHTML = html,
  only on first paint (data-v136-rendered not yet '1'), #chatList gains v173-first-in
  (opacity 0 -> 1, .25s), removed after 260 ms. WHY: the skeleton -> list swap was
  instant; one container fade gives visual continuity. Gated on first paint only, so
  later sig-guarded renders never replay it.
- P2.3 Unread flash trim — WHAT: .chat-item.v105-newmsg animation 1.4s -> .8s,
  flash green rgba(37,211,102,.14) -> .12. WHY: the 1.4 s background flash lingered;
  800 ms keeps the unread-growth highlight (still gated on unread growth) while
  feeling snappy. Background-only exception per the audit.
- P2.4 Load-more row entry — WHAT: in inboxAppendShown(), freshly inserted rows
  (index preCount...) gain v173-row-in (opacity 0 -> 1, translateY(4px), .18s),
  removed after 200 ms. WHY: appended rows are fresh nodes, so a gentle entry is
  safe there; rows already on screen are never touched. Never applied in
  renderChats() or inboxPatchRow().
- P2.5 Update reload fade — WHAT: at all three user-initiated reload sites in
  v110ApplyUpdate() (800 ms waiting-worker timeout, direct path, no-service-worker
  branch), the bare location.reload() is replaced by: re-run the exact call/game
  guard verbatim (fresh getElementById('callModal') / ('callMiniBar') / callState
  status check + v123GameModal check, same toasts), then add class v173-reloading
  to body, then setTimeout(location.reload, 180). CSS: body.v173-reloading #app and
  #v108UpdateBar fade to opacity 0 over .18s. WHY: the reload was the only genuinely
  abrupt transition in this area; the 180 ms fade softens it. The 800 ms site already
  contained the verbatim re-check (v172 G-06), so only the fade + delay was added
  there; the other two sites got the verbatim guard re-check added before the fade,
  exactly as the audit requires. The catch fallbacks keep the bare reload (no fade
  on the error path). The guards themselves were never edited.
- P2.6 Update-bar trim — WHAT: #v108UpdateBar animation v84BarIn .38s -> v173BarIn
  .25s. WHY: 380 ms exceeds the feel-bar range; same 16 px rise shape, now 250 ms.
  Dismiss path untouched (180 ms, already in range).

Area 3 — Presence / typing / ticks / messages:
- P3.1 Presence dot scale-in — WHAT: .avatar .dot and .story-online gain
  animation v173DotIn .18s (scale .4 -> 1). WHY: the dot previously blinked in/out
  with no motion; every dot is created as a fresh element on a flip, so the entry
  animation plays exactly on creation. Removal stays instant (reads as "went offline").
- P3.2 Dot ping scoped to header — WHAT: .avatar .dot::after animation none;
  #chatAvatar .dot::after keeps v102Ping 2s infinite. WHY: an infinite pulsing ring
  on EVERY online row was the largest continuous compositor cost in the inbox and
  read as busy; the single header avatar keeps the ping as the "this person, right
  now" signal.
- P3.3 Typing bubble fade-out — WHAT: new top-level helper v173TypingFadeOut()
  (main script, before refreshTypingFallback): adds v173-typing-out to #typingLine
  (bubble opacity -> 0 over .15s), clears innerHTML after 150 ms, removes the class.
  Hooked at all three hide sites (broadcast else branch, 2500 ms hide timer,
  refreshTypingFallback else branch). The if(!$('typingLine').innerHTML) guard is
  untouched, so the dots' bounce phase still never restarts mid-typing. WHY: the
  bubble previously vanished instantly; a 150 ms fade is imperceptible as delay
  (hide at 2650 ms vs 2500 ms) and changes no state. Safety: the pending fade timer
  id is kept in window._v173TypingFadeT and cleared when new typing arrives, so a
  fade started just before a new keystroke can never wipe a live bubble.
- P3.4 Tick seen pop soften — WHAT: .msg .foot .ticks.seen animation v102TickPop
  .25s -> v173TickPop .18s (peak 1.35x -> 1.12x). WHY: the 1.35x pop read as
  cartoonish on a 13 px checkmark; the colour glide (.25s, untouched) + a 1.12x pop
  is the premium version. The fresh-element replay on every tick change is desired
  (it IS the seen-feedback).
- P3.5 / B6 One canonical message entry — WHAT: .v49-polish #messages .msg and
  #messages .msg:last-child both use v173MsgIn .18s (translateY(4px) rise; was pop
  8 px / mixed .22s last-child). WHY: four rules competed and the last (newest, most
  watched) bubble animated differently from the rest; now every bubble uses one
  keyframe. Old rules left in place (overridden, noted for a future cleanup).

Area 4 — General polish:
- P4.1 Modal sheet canonical entry — WHAT: .v49-polish .modal .sheet animation
  v173SheetIn .22s (translateY(14px) scale(.985)). WHY: three sheet-entry rules
  competed (.22s / .32s / .22s); effective today was already .22s via the body class,
  but the outcome depended on that class surviving. Now one canonical rule. Exit
  (.v102-closing .15s + closeModal 150 ms timer) untouched.
- P4.2 Tab pill trim — WHAT: body .v105-tab-pill transition .3s -> .22s (transform
  + width). WHY: a 300 ms pill glide lagged behind rapid tab taps; 220 ms keeps up
  with the finger. v105MoveTabPill() already sets transform/width inline.
- P4.3 Tab-count pop — covered by P4.6 (same chipPop keyframe); no per-site change.
- P4.4 Auth tab fade (optional item — DONE) — WHAT: setTab() now adds
  v173-auth-swap to #auth .card (.15s opacity fade from .35), removed after 160 ms.
  WHY: the Login/Signup field swap was instant; a 150 ms fade softens the single tap
  without touching the field logic.
- P4.5 Desktop chat-open pane animation — DECIDED AGAINST per audit; not added.
  (Header fade + message entries + instant content swap already cover it.)
- P4.6 chipPop soften — WHAT: @keyframes chipPop in the v173 block (peak 1.25 ->
  1.08, start .4 -> .85, same .22s family) + direct edit of @keyframes v105ChipPop
  at its definition (peak 1.2 -> 1.08, start .5 -> .85). WHY: the badge/count/
  reaction pop is a genuine micro-interaction (WhatsApp does pop its badge); only
  the overshoot was cartoonish. Covers the inbox badge, tab-count pop, notification
  badge, and message reactions in one place.

CUTs applied (feel bar — cheap / slow / gimmicky, removed or softened):
- C1 chipPop/v105ChipPop overshoot cut via P4.6. C2 send-button morph rotation cut:
  .send-btn.v105-sent now uses v173SendPulse .18s (scale 1 -> 1.06 -> 1, no rotation;
  was v105SendMorph .35s with rotate -4 deg). C3 reaction fly-up cut: the
  v105ReactFly(msgId, emoji) call site in toggleReaction REMOVED (one line); the
  helper + CSS stay as inert dead code for easy revert (see N4). C5 infinite
  auth-logo pulse cut: #auth .logo::after now plays once (was infinite); the splash
  instance is untouched. C6 infinite story glow cut: .story-ring.unseen animation
  none (static green border stays). C7 infinite dot ping on inbox rows cut via P3.2.
  C10 splash tagline stagger trimmed 35 ms -> 25 ms steps (~0.86 s -> ~0.7 s total).
  C11 over-long entrances trimmed, not cut (update bar, sheet, #app — see P2.6/P4.1/
  P1.2). C4 / C8 / C9 / C12 "do not do" items: big-heart untouched, no row stagger
  reintroduced, no game/confetti work, no new spring/bounce/rotation/delight invented.

================================================================
§2 BUG FIXES — B1–B6, all FIXED (WHY + FIX)
================================================================
| # | Bug | WHY it happened | FIX (minimal) |
|---|---|---|---|
| B1 | Bulk-open animation storm: opening a chat replayed the pop on all ~50 bubbles | reloadOpenChat() already guarded the identical situation with .v152-no-anim, but openChatById() did not; refreshMessages(true) re-appends up to 50 bubbles via appendMessage() | Added $('messages').classList.add('v152-no-anim') before the seeded-cache paint and removed it after refreshMessages(true). The add was placed one step earlier than the audit snippet (before v168SeedOpenChatFromCache()) because the seed also appends animated bubbles — same storm, same mechanism, one guard covers both. |
| B2 | Send double-pop: one sent message animated twice (temp bubble, then real bubble) | Temp and real bubbles are different DOM nodes with the same entry animation; nothing suppressed the second pop | Wrapped temp-remove + afterSend() in the .v152-no-anim guard in both sendMessage() and sendGroupMessage() (temp gtemp-...). Robustness: the afterSend() await sits in try{...}finally{ remove guard } so a throwing refresh can never leave the guard stuck on. Failure path unchanged (queued temp keeps its pop + v130-queued tag). |
| B3 | Tab-switch fade raced the async rebuild (fade played on stale rows, new rows arrived unanimated) | Animation trigger and content arrival were in different (a)synchronous phases — setInboxView fired the 180 ms fade immediately, inboxRebuildWindow fetched the index later | Flag-gated re-trigger: top-level var _v173TabSwapPending = false; setInboxView now only sets the flag; inboxRebuildWindow() re-triggers .v102-tab-swap immediately after its final renderChats() when the flag is set. Background rebuilds never set the flag. |
| B4 | Dead refresh-button CSS targeted non-existent #v44InboxRefresh | Button moved to #v49InboxRefresh in v49; the v44 rule was never retargeted; the v44 injection is intentionally disabled | Added #v49InboxRefresh{width:36px;height:36px;flex:none} in the v173 block (the intended sizing, now on the real id) + a comment on the old rule, left in place. No markup/id/onclick change. |
| B5 | Dead auth-card entrance rule targeted non-existent .auth-card | Card class renamed .auth-card -> .card; the rule was never updated | Deleted the one line #auth .auth-card{animation:msgIn .35s ease .24s both}. NOT retargeted to .card (that would double-animate with v105CardIn). Zero visual change — the rule never matched. |
| B6 | Message entry defined 3x with different winners (last bubble animated differently) | Four rules accumulated across versions without canonicalisation | CSS half in P3.5 (single v173MsgIn .18s on both selectors) + JS half in B1. Old rules left in place, overridden. |

================================================================
§3 FOUND, NOT FIXED — N1–N6 (deliberately untouched, with reason)
================================================================
- N1 "Online" can linger up to 60 s after a peer goes offline (last_seen window).
  NOT FIXED — by design (comment L3819; the instant presence-map path already
  exists). Needs a server-side heartbeat / product decision, not polish. The P3.1
  dot scale-in makes the eventual flip visible.
- N2 No pull-to-refresh on the inbox. NOT FIXED — verified absent; a new feature
  needing a gesture recogniser + indicator + overscroll-behavior conflict handling.
  Needs the user's decision.
- N3 Search results replay their pop on every debounced keystroke (.user-result
  pop). NOT FIXED — out of scope, low severity (debounced, in-range duration).
  Proper fix needs a first-results-only class inside inboxRunSearch.
- N4 v105ReactFly helper is now dead code (C3 removed its only call site).
  NOT FIXED (by choice) — one-line removal, easy to revert; full deletion of the
  helper + its CSS is a later cleanup.
- N5 JS reduce probe at L7411. VERIFIED, not a bug: the probe IS consumed —
  v151UpdateStatusMarquee() returns early when matchMedia('(prefers-reduced-motion:
  reduce)') matches, falling back to the single-line ellipsis. v173 adds no
  JS-gated motion, so nothing to break.
- N6 No call bugs listed or hunted. Deliberate per the user rule (call code is
  never touched while it works).

Also checked and NOT "fixed" (audit §11.3, all by design): updateChatHeader() 150 ms
fade matches its .15s transition; hideSplash() 340 ms vs 300 ms transition (40 ms
slack intentional); #messages scroll auto !important (L16685) is by design;
closeModal() 150 ms timer matches the exit animation; v44ManualRefresh() finally
restores the button; inboxLightCheck() never rebuilds on presence-only changes
(by design); v105NewMsg flash is gated on unread growth; typing-bubble guard
preserved in P3.3.

================================================================
§4 SKIPPED — call-related (user rule 21 Nov 00:59) + decided-against
================================================================
All 14 call items skipped; none implemented, none touched: S1 v39 production
voice-call block (byte-identical); S2 call-screen entrance animations; S3 call fade /
ringing pulse; S4 connected-timer pulse; S5 connect burst rings; S6 floating call
pill; S7 call toast; S8 call "More" menu pop; S9 call-screen styles incl.
.call-grid-btn:active{scale(.94)} and the v38 call-layout-fix style block; S10
call-screen design upgrade block; S11 update-reload call guards (never edited —
P2.5 only re-runs them verbatim); S12 v105 ripple selector (not extended to any
call class); S13 note — v137StartChatPresence / typing channel are 1-to-1 *chat*
presence, not voice-call, and are in scope; S14 any call-adjacent shared rule
(global button rules were NOT edited — verified in the diff; the v173 block
contains zero bare-button selectors and zero call identifiers).
Also skipped by decision: P4.5 desktop chat-open pane animation; pull-to-refresh
(verified absent — a new feature, not polish, needs the user's decision).

================================================================
§5 VERIFICATION RESULTS (all 10 checks PASS, 0 FAIL)
================================================================
Independent verification (separate subagent, full report in hidden_files/v173_verify/
VERIFY.md). All checks run on the pre-packaging file (index md5 38fb3e82...); the
only change after verification was the release-date string (01:15 -> 01:23), after
which the call block, node --check, counts and version strings were re-verified
(see the re-verification line at the end of this section).
| # | Check | Result | Numbers |
|---|---|---|---|
| 1 | Call block invariant (canonical inner-content md5) | PASS | 63e54beeafa890f9383ad9195ab78c61 — exact match |
| 2 | node --check all inline scripts | PASS | 46 blocks, 0 errors (same as v172 baseline) |
| 3 | Behaviour suites + load | PASS | Regression 67/0; game-listener 18/0; quota idle DM 709, inbox 359, group 529 (v172: 710/360/530 — one fewer each, no regression); first paint 0 ms, index load 1203 -> 1202 ms, hung-network 4002 ms |
| 4 | Expose audit + v173TypingFadeOut | PASS | DEAD: 0; helper never in any onclick (0 refs), top-level function called from JS only at 3 sites |
| 5 | Version strings + md5 | PASS | v173, release 21 Nov 2026, 01:15 (then -> 01:23, see note), sw.js cache chatbox-v173, stale v172 refs 0; index md5 38fb3e82e8d4639e57ed1c2150cfb731 (pre-packaging) |
| 6 | QR/share fix preserved | PASS | chatbox01.pages.dev x3, chatbox-41j x0 |
| 7 | Diff review (163 lines, 27 hunks, 123 changed) | PASS | No hunk inside call block or call-CSS ranges; no network/bot/data-flow changes (0x fetch(/supabase/.from( etc.); P2.5 guards byte-identical (800 ms site) / logic-identical after var rename (direct + no-SW sites); v105ChipPop only scale values changed; B1 guard correctly wraps seed + refresh |
| 8 | B1–B6 fixed; N1–N6 untouched | PASS | All 6 B-fixes present at claimed locations; all 6 N-items verified still unfixed (incl. N4 v105ReactFly defined, 0 call sites) |
| 9 | Call exclusion in polish block | PASS | All call identifiers 0; bare button selectors 0 (only 2 comment mentions); block is 79 lines / 5,122 bytes as claimed |
| 10 | Implementation completeness (one exec call failed during build) | PASS | Nothing claimed in CHANGES.md is missing — every P/C/B item, version bump, sw.js change verified present; the only exit-1s seen were diff = files differ, normal |
Notes (not FAILs): CHANGES.md line count is off by one (claims 40,086 lines; measured
40,085 — reporting only). Load-table variance is noise (1202 vs 1203 ms). B1 guard has
no try/finally — matches the audit snippet and the pre-existing reloadOpenChat pattern
(a throwing refreshMessages would leave the guard on — observation only).
Re-verification after the release-date change (01:15 -> 01:23, coordinator): call
block md5 63e54beeafa890f9383ad9195ab78c61 (unchanged), node --check 46 blocks / 0
errors, chatbox01.pages.dev x3, chatbox-41j x0, stale v172 version refs 0, index md5
61aaab7fad3d3f8ad72cc98830e3c321 (this file), sw.js md5 e2032c586e0d92dae4f45c49581c925e.

================================================================
§6 SQL
================================================================
v173 needs NO new SQL. The v172 SQL live-status note still stands: §0, §1-1a,
§1-3a (adapted), §2 C-12 and §3 S-1 run live 20 Nov 2026 and verified; §3 E-06
and §3 F11 STOPPED and need a rework — do not run them as written; §1-1b,
§1-3c, the view_once_views table and the muted_chats table must NOT be run.
No Supabase changes were made for v173.

================================================================
§7 WHAT IS NOT VERIFIED (live browser — owed after deploy)
================================================================
Splash -> login -> inbox first paint / CLS in a real browser; chat open with 50
messages (B1 zero pops live); send (B2 one pop live); typing fade; presence-flip
dot scale-in; tab-switch fade timing (B3); modal/tab/toast timings; update-apply
flow (P2.5 — status text only, do NOT apply the update in the test);
reduced-motion pass; call-screen smoke check (open only, nothing modified).
Mobile-width (320/390 px) screenshots light + dark were not captured in this build
(no live browser in this session) — the user's own phone is the real mobile test.

================================================================
§8 DEPLOY NOTES
================================================================
- ZIP: chatbox-supabase-v173-2026-11-21.zip, exactly 11 files at ZIP root
  (index.html, sw.js, manifest.json, favicon.svg, logo.png, icon-192.png,
  icon-512.png, icon-maskable-512.png, chatbox-call-doodle-bg.jpg, _headers,
  README-v173.txt). Built from INSIDE the folder; extraction-verified.
- Deploy: Cloudflare Pages -> chatbox01 project -> Create deployment -> upload
  the ZIP (user deploys — Cloudflare work is his). After deploy, PWA update
  applies after full close + reopen or via the Update button; never during a call.
- The new backend is the new Supabase project (ref dpohgpccqkbzazbbikwx,
  Singapore); the app talks to it via the keys already in index.html.
- v172 + QR-fix (fix1) is superseded by v173. Do not deploy fix1 again.
