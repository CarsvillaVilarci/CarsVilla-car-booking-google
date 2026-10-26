# Vride — Architecture & Pipeline Tracker

Living doc. Updated as decisions get made and work lands. This is the
single source of truth for "why is it built this way" — update it
whenever an architecture decision changes, don't let it go stale.

---

## 1. What we're building

**Vride** — a car-booking app. Two portions, built in two phases:

- **Phase 1 (building now): User portion.** Sign up / log in, browse a
  list of vehicles (added by partners), pick one, request it, contact
  the owner to arrange travel to a destination.
- **Phase 2: Partner portion.** Decided to build this in the same app
  (not a separate build) since we're still early — a header icon
  switches the whole bottom tab bar into a partner view (Dashboard/
  My Vehicles/Requests/Profile). Real-time Uber-style dispatch is
  still future work; everything else runs on demo data for now.

**Status:** 🟡 Rider side (Listing → Vehicle Detail → Chat, Live
Booking demo, full Car Help flow, Profile) and Partner side (all 4
tabs) are both built on demo data, typecheck/bundle clean. Auth
(phone OTP via WhatsApp) is coded and now gates only the Profile tab
— browsing everything else requires no login. **Blocked on manual
setup** — see §8 — before OTP actually delivers end-to-end; until
then, signing in on the Profile tab will show a real (but failing)
network error, which is expected. Nothing is wired to the real
database yet — see §4.

The old RideFlow prototype's uncommitted `App.tsx`/`app.json`/
`package.json` changes were stashed (not deleted) before the rewrite —
recoverable via `git stash list` if ever needed. The dependency
*versions* from that stash (Expo 57/React 19/RN 0.86) were kept since
they're a legitimate upgrade, independent of the old monolith UI.

---

## 2. Accounts & backend topology

Two Supabase accounts, four projects total:

| Project | Account | Access | Role |
|---|---|---|---|
| `Vilarci-server` (`gxvcgubbqtccoycvdupq`) | A (MCP-connected) | Supabase MCP tools | Existing production backend for a *different* product ("Vilarci" — marketplace/delivery/wallet app). We're **borrowing** its WhatsApp-OTP login mechanism, not its data. |
| `Vilarci-study` (`algemlaorwwjgldhcbuw`) | A (MCP-connected) | Supabase MCP tools | Not yet relevant to Vride. |
| `CarsVilla-car-book-app` (`pbrodwmubjffvfwxtowq`) | B (NOT MCP-connected) | Direct Postgres (connection string given in chat) — no dashboard/API access, so Auth settings, Storage, and Edge Function deploys on this project need **you** to do them in the Supabase dashboard; I can hand you exact SQL/config. | **This is Vride's actual backend.** All app tables live here. |
| 4th project | B | Not given yet | Deferred — "add later as needed." |

⚠️ Security note carried over from earlier: the `pbrodwmubjffvfwxtowq` DB
password was pasted in plaintext in chat. Worth rotating in Supabase
dashboard → Settings → Database once we're done, if this chat log isn't
fully private.

---

## 3. Auth design: WhatsApp OTP (reusing Vilarci-server's pipeline)

Investigated how `Vilarci-server` does "WhatsApp login" — it's **not** a
custom OAuth provider. It's:

1. Real **Supabase Auth**, phone sign-in (`supabase.auth.signInWithOtp({ phone })`).
2. A Supabase **Auth Hook** of type "Send SMS", configured in
   Authentication → Hooks in the Supabase dashboard, pointing at an
   Edge Function.
3. That Edge Function (`vilarci-msg91-otp`, deployed in `Vilarci-server`)
   receives `{ user: { phone }, sms: { otp } }` from Supabase and
   forwards it to **MSG91's WhatsApp Business API** as a template
   message (template `vilarci_otp`, business number `917363846235`),
   instead of sending a plain SMS. That's the whole "WhatsApp login" —
   it's Supabase phone-OTP auth with the delivery channel swapped to
   WhatsApp via MSG91.
4. `public.users` profile table (in `Vilarci-server`) stores
   `whatsapp_number` + name fields, keyed by the Supabase auth user id.

**Decision: built from zero, self-contained in `CarsVilla-car-book-app`.**
Not reusing `Vilarci-server`'s function — that would spend its MSG91
quota/storage for a different product. Instead:

- New Edge Function `vride-whatsapp-otp`, same forwarding logic as
  `vilarci-msg91-otp` but fully parameterized via secrets (no hardcoded
  business number/template) — code lives at
  `supabase/functions/vride-whatsapp-otp/index.ts` in this repo.
- Needs its own MSG91 WhatsApp template (e.g. `vride_otp`) and its own
  `MSG91_AUTH_KEY` + business number, set as Edge Function secrets on
  `pbrodwmubjffvfwxtowq`.

**I can't deploy this function or configure Auth Hooks myself** — Edge
Function deploys and Auth Hook config are Supabase dashboard/
Management-API actions, not SQL, and `pbrodwmubjffvfwxtowq` isn't
MCP-connected. See §8 for the exact manual checklist.

---

## 4. Data model plan (CarsVilla-car-book-app project)

- **`profiles`** ✅ created. One row per Supabase auth user:
  `id` (= `auth.users.id`), `full_name`, `whatsapp_number`, `role`
  (`rider`/`partner`, defaults `rider`), `created_at`. RLS: a user can
  select/update only their own row. A `handle_new_user()` trigger on
  `auth.users` auto-inserts the row (with `whatsapp_number` pre-filled
  from the auth phone) the moment someone signs up — no insert policy
  needed.
- **`partners`** — not created yet (not needed until vehicle listing
  starts). Vehicle owners. For Phase 1, rows are seeded/managed by us
  directly (no partner login UI yet). Fields: name, phone,
  `subscription_status` (mirrors `Vilarci-server`'s
  `seller_subscriptions` pattern: plan_type/status/start_at/end_at).
- **`vehicles`** — not created yet. `partner_id` FK from day one.
  Brand/model/trim/year, category, pricing, seats, an `images` array
  (real photos — see §6 Q2), location fields.
- **`vehicle_requests`** — not created yet. A user "requests" a
  vehicle (the chosen contact flow). Row per request: user_id,
  vehicle_id, status.

**Contact-flow interpretation** (confirm in §6 Q3): user taps "Request
this vehicle" → creates a `vehicle_requests` row. Whether the owner's
phone number is revealed to the user depends on
`partners.subscription_status` — unsubscribed partners' numbers stay
hidden (this is the monetization lever: partners pay to receive
contactable leads).

---

## 5. App structure — built

Old single 1478-line `App.tsx` state-machine replaced with **React
Navigation** (`@react-navigation/native` + `native-stack`) — the
native-stack header *is* the fixed top bar, and it gives real
hardware/gesture back-button handling for free, which is what was
missing before. `App.tsx` at repo root is now just the entry point
(providers + `<RootNavigator />`); everything else lives in `src/`:

```
src/
  theme/colors.ts          — light-maroon palette (see below)
  lib/supabase.ts          — supabase-js client, reads EXPO_PUBLIC_* env vars
  context/AuthContext.tsx  — session + profile (full_name/role), via onAuthStateChange
  data/
    demoVehicles.ts        — 10 seeded demo vehicles w/ real CarsVilla photos
    demoChats.ts           — seed messages for the chat demo
  navigation/
    types.ts                — param list per stack + both tab bars
    RootNavigator.tsx        — just NavigationContainer + ModeAwareNavigator now
    ModeAwareNavigator.tsx   — picks TabNavigator vs PartnerTabNavigator by useAppMode()
    TabNavigator.tsx         — rider's 4-tab bottom bar, each tab its own nested stack
    PartnerTabNavigator.tsx  — partner's 4-tab bottom bar
  components/
    PrimaryButton.tsx       — solid/outline variants
    ScreenContainer.tsx     — SafeAreaView (bottom/sides only) + KeyboardAvoidingView
    AppHeader.tsx, CategoryPill.tsx, VehicleCard.tsx
  screens/
    auth/PhoneScreen.tsx, OtpScreen.tsx, NameScreen.tsx, AuthGateScreen.tsx — see gate note below
    VehicleListScreen.tsx, VehicleDetailScreen.tsx, ChatScreen.tsx   — tab 1: Listing
    LiveBookingScreen.tsx                                            — tab 2: Live Booking (Uber/Rapido-style demo)
    CarHelpScreen.tsx + Help*.tsx                                    — tab 3: Car Help (full flow, see §ChangeLog)
    ProfileScreen.tsx                                                — tab 4: Profile (rider)
    partner/*.tsx                                                    — Partner mode's 4 screens
```

**Bottom tab bar** (`TabNavigator.tsx`): Listing / Live Booking / Car
Help / Profile, each its own native-stack so headers stay consistent
(`tabBarIcon` swaps filled/outline Ionicons per focus state). Listing
is the only multi-screen tab: VehicleList → VehicleDetail → Chat.

**Auth gate — scoped to the Profile tab only.** Originally the whole
app was gated behind login (then bypassed entirely for preview); now
it's scoped properly: Listing/Live Booking/Car Help need no login at
all (browse freely), and only the Profile tab's own nested stack
(`ProfileStackNavigator` in `TabNavigator.tsx`) checks `useAuth()` and
conditionally renders `AuthGateScreen → Phone → Otp` (if no session),
`NameScreen` (session but no `profiles.full_name` yet), or the real
`ProfileScreen`. `RootNavigator.tsx` no longer knows anything about
auth — it's just `NavigationContainer` + `ModeAwareNavigator`. Since
the OTP backend (§8) isn't wired up yet, tapping "Sign In" on the
Profile tab will hit a real `supabase.auth.signInWithOtp` call that
fails with a network/config error — that's expected until §8 is done,
not a bug.

**Chat system:** `VehicleDetailScreen` always shows a "Message Owner"
button → `ChatScreen` (bubble UI, seeded greeting, local-only state —
no persistence/backend yet). Subscribed owners additionally get
Call/WhatsApp buttons above it; unsubscribed owners only get the chat
button — this is now the live demo of the subscription-gated contact
idea from §4.

**Live Booking tab:** pickup/destination inputs, 4 ride tiers
(Bike/Auto/Cab/Premium), "Book Ride" → simulated searching → matched
driver card with demo Call/Cancel. Explicitly labelled in-UI as a
preview — real-time dispatch is the Phase 2 Uber-style work, not built.

**Car Help tab — full flow, not just alerts:** landing
(`CarHelpScreen`) → category tap → `HelpRequestFormScreen` (location
row + optional description) → `HelpTrackingScreen` (simulated
searching → assigned partner with name/service/ETA/rating, Call +
Resolved + Cancel) → `HelpHistoryScreen` (status-badged list of past/
active requests, tap to resume). SOS skips the form — its alert offers
both "Call Now" (`tel:` dial) and "Request Help" (creates a priority
request, jumps straight to tracking). An active-request banner on the
landing screen links back into tracking so a request isn't lost by
navigating away. State lives in `HelpRequestsContext`
(`src/context/HelpRequestsContext.tsx`) — session-only, no backend —
so requests persist across screens/tabs but not app restarts. Category
and demo-partner data: `src/data/helpCategories.ts`.

**Profile tab:** demo user header, stats row, settings-style menu
(all "Coming soon" alerts for now), log-out button.

**Custom top bar** (`src/components/AppHeader.tsx`, replaces every
stack's default native header via the `header` screen option): on
root/no-back screens it shows the Vilarci logo badge
(`officialpic.vilarci.in/Icons/web-icon.png`) + screen title, plus a
mode-switch icon, a wallet balance pill, and a notification bell with
an unread-count badge on the right (wallet/notifications are demo
values — no backend yet). On pushed screens it swaps to a circular
back button + title instead. Auth/onboarding screens (Phone/Otp/Name)
are special-cased to hide the right-side actions since there's no
signed-in user yet. A thin gold accent line runs along the bottom
edge, and a subtle diagonal light sweep animates across the header
background every ~4s (`expo-linear-gradient` + `Animated`,
native-driver, non-interactive) for a bit of premium motion without
being distracting.

**Partner mode** — same app, no separate build. Tapping the briefcase
icon in the header (`useAppMode` in `src/context/AppModeContext.tsx`)
swaps the entire bottom tab bar from the rider's `TabNavigator` to
`PartnerTabNavigator` (`ModeAwareNavigator.tsx` picks between them).
Partner tabs: **Dashboard** (stats + subscription status card),
**My Vehicles** (list with Active/Inactive toggle, Edit/Delete, "+ Add
Vehicle" form), **Requests** (incoming rider requests with Accept/
Decline, a detail screen with Call), **Profile** (partner identity,
subscription card, menu, "Switch to Rider Mode"). State lives in two
new contexts — `PartnerVehiclesContext` and `PartnerRequestsContext`
— seeded with demo data, session-only like the rider-side contexts.
The header's mode-switch icon flips direction automatically (briefcase
↔ car) based on current mode, and wallet/notification copy adjusts
text ("Partner Wallet" vs "Vride Wallet").

Theme: light background (`#FBF5F4`), deep maroon primary (`#7A1F2B`),
gold accent (`#D4A657`) — see `src/theme/colors.ts`. Real icons via
`@expo/vector-icons` (`Ionicons`) throughout, no emoji/text glyphs.

Verified after every change this session: `npx tsc --noEmit` clean,
`npx expo export --platform web` bundles successfully, no errors.

**Not started yet:** `vehicles`/`partners`/`vehicle_requests` tables —
everything above still runs on the demo data in `src/data/`, not the
real `CarsVilla-car-book-app` database.

---

## 6. Open questions (vehicle-listing phase — not blocking auth)

1. **Vehicle seed data** — do the image sets you pasted map to real
   `partners` (actual distinct owners), or is CarsVilla itself the
   single owner/fleet for all of them right now? Affects whether we
   seed one placeholder partner or several.
2. **Confirming contact-flow interpretation** — "request it, and the
   number only shows if the partner has an active subscription" — is
   that right, or did you mean something slightly different (e.g.
   number always hidden, only an in-app message goes to the partner)?
3. Any existing brand asset (logo, exact maroon hex) to match, or is
   the palette in §5 good to run with?

---

## 7. Status

- ✅ `profiles` table + auto-provisioning trigger (live on
  `pbrodwmubjffvfwxtowq`).
- ✅ Phone/OTP/Name/Home screens, navigation, theme, Supabase client —
  coded, typechecks, bundles.
- ✅ `vride-whatsapp-otp` Edge Function code written (not deployed —
  needs you, see §8).
- ⬜ §8 manual setup (MSG91 + Supabase dashboard) — **blocks real OTP
  delivery.** Until done, `signInWithOtp`/`verifyOtp` calls will fail
  because there's no SMS/WhatsApp provider wired up on the project yet.
- ⬜ Vehicle listing (schema + screen) — not started.

---

## 8. Manual setup checklist (you — I can't do these)

**A. MSG91 console**
1. Create/confirm a WhatsApp Business API sender number for Vride
   (can be the same MSG91 account as Vilarci's, just a distinct
   template — or a separate account entirely; either works, doesn't
   change the code).
2. Create a new WhatsApp template, e.g. `vride_otp`, body along the
   lines of: *"Your Vride verification code is {{1}}. Valid for 10
   minutes. Do not share this code."* with one button-type variable
   if you want the "copy code" button (matches the existing
   `vilarci_otp` template shape). Submit for WhatsApp approval —
   this can take a few hours.
3. Once approved, note down: **MSG91 Auth Key**, the **WhatsApp
   integrated number** (digits only, e.g. `9170XXXXXXX`), the
   **template name**, and the **namespace** (shown in MSG91 console
   next to the template).

**B. Supabase dashboard — `CarsVilla-car-book-app` project**
4. Authentication → Providers → enable **Phone**.
5. Edge Functions → create a new function named `vride-whatsapp-otp`,
   paste in the contents of `supabase/functions/vride-whatsapp-otp/index.ts`
   from this repo.
6. Edge Functions → `vride-whatsapp-otp` → Secrets → add:
   `MSG91_AUTH_KEY`, `MSG91_WA_INTEGRATED_NUMBER`,
   `MSG91_WA_TEMPLATE_NAME`, `MSG91_WA_NAMESPACE` (values from step A3).
7. Authentication → Hooks → **Send SMS hook** → point it at the
   `vride-whatsapp-otp` function.
8. Project Settings → API → copy the **anon public** key → send it to
   me (or drop it straight into this repo's `.env` as
   `EXPO_PUBLIC_SUPABASE_ANON_KEY`) so the app can actually talk to
   the project.
9. (Carried over from earlier) consider rotating the DB password that
   was pasted in plaintext in chat, Settings → Database.

Once 4–8 are done, phone sign-up/login should work end to end — I'll
test it with you once the anon key is in.

---

## 9. Changelog

- *Session start:* Investigated `Vilarci-server` — confirmed WhatsApp
  OTP mechanism (§3), found `seller_subscriptions` pattern. Rolled back
  earlier premature `vehicles`/`rides` table creation on
  `CarsVilla-car-book-app` (confirmed empty again). This doc created.
  No app code changed yet.
- *Auth build:* Decided to build the WhatsApp-OTP pipeline from zero
  (not reusing Vilarci-server's). Stashed uncommitted RideFlow
  prototype changes (`git stash` — recoverable), kept its dependency
  upgrades (Expo 57/React 19/RN 0.86), rebuilt `App.tsx` from scratch
  with React Navigation. Created `profiles` table + trigger on
  `pbrodwmubjffvfwxtowq`. Wrote `vride-whatsapp-otp` Edge Function
  code. Moved all frontend source into `src/` per your request.
  Verified with `tsc --noEmit` and `expo export --platform web` —
  both clean. Rebranded app.json/package.json display name to Vride
  (native bundle identifiers left untouched — not asked for).
