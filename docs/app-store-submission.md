# ArmTrack — App Store Submission Checklist

The white-screen rejection is fixed (local bundle + daily local notification). This
covers what's most likely to get you re-rejected, in priority order.

## 1. In-app account deletion (Guideline 5.1.1(v)) — REQUIRED
Apps with account sign-up MUST let users delete their account in-app. Built:
- **Backend:** run `docs/migrations/2026-06-11-account-deletion.sql` in Supabase.
- **UI:** `/profile` → "Delete account" (two-tap confirm → wipes data → deletes auth user → signs out).
- ✅ **TEST IT before submitting:** make a throwaway account, delete it, confirm it's gone in Supabase → Authentication → Users. Apple's reviewer *will* test this.

**If the SQL errors with "permission denied for table users"** (some projects can't delete `auth.users` from SQL), use this Edge Function instead and change the app call from `supabase.rpc("delete_my_account")` to `supabase.functions.invoke("delete-account")`:

```ts
// supabase/functions/delete-account/index.ts  — deploy: supabase functions deploy delete-account
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
Deno.serve(async (req) => {
  const auth = req.headers.get("Authorization");
  if (!auth) return new Response("no auth", { status: 401 });
  const url = Deno.env.get("SUPABASE_URL")!;
  const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return new Response("invalid session", { status: 401 });
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const uid = user.id;
  await admin.from("arm_logs").delete().eq("user_id", uid);
  await admin.from("follows").delete().or(`follower_id.eq.${uid},following_id.eq.${uid}`);
  await admin.from("team_members").delete().eq("player_id", uid);
  await admin.from("teams").delete().eq("coach_id", uid);
  await admin.from("profiles").delete().eq("id", uid);
  await admin.auth.admin.deleteUser(uid);
  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
});
```

## 2. Demo account for the reviewer — REQUIRED
ArmTrack is behind login, so the reviewer can't get in without credentials. The #1
"we couldn't review your app" rejection. In **App Store Connect → your version → App
Review Information → Sign-In Information**, provide a working test account:
- Create a real account (e.g. `applereview@armtrack.app` / a password), complete onboarding as a **coach** (so they see the most features), and join/seed a little data.
- Put that email + password in the Sign-In Information fields. Check "Sign-in required."

## 3. Privacy Policy URL — REQUIRED
- App Store Connect → App Information → **Privacy Policy URL:** `https://armtrack.app/privacy`
- (Make sure that page is deployed and the contact email on it is real.)

## 4. App Privacy "nutrition labels"
In App Store Connect → App Privacy, declare what you collect. For ArmTrack that's roughly:
- **Contact Info:** email address (for account).
- **Health & Fitness:** the arm-health data you log (pain/soreness/throws) — declare as "Health & Fitness" or "Other User Content," linked to identity, used for app functionality.
- **User Content:** profile info.
- Not used for tracking/ads. Be accurate — mismatches here cause rejections.

## 5. Age rating — do NOT check "Made for Kids"
Set the content rating honestly (no objectionable content → likely 4+/9+). **Do not** enroll in the **Kids Category** — that triggers strict COPPA/kids rules and bans third-party analytics. Your 13+ age gate + parent/coach model for under-13 is the right posture for a general (non-Kids-Category) app.

## 6. Review notes (paste into App Review Information → Notes)
> ArmTrack is an arm-health tracker for baseball/softball players and coaches. Sign-in is required — a demo coach account is provided above. Native functionality: the app schedules a daily local notification (UNUserNotificationCenter) reminding players to log. The previous build's blank-screen issue (it loaded a remote URL) is fixed — this build ships a fully local static bundle and works offline. Users can delete their account in-app under Profile → Delete account. Health-related data is self-reported and used only to show the user/their coach a readiness trend; the app does not provide medical advice. Privacy policy: https://armtrack.app/privacy

## 7. Build steps (on the Mac)
- [ ] `git pull`
- [ ] Run all pending migrations in Supabase (public-profiles, follows, account-deletion; run the rls-audit)
- [ ] `npm run build && npx cap sync ios`
- [ ] In Xcode: bump the **build number**, select your team, Archive → Distribute → upload
- [ ] Test on a device: launch in Airplane Mode (no white screen), complete onboarding (notification prompt appears), and **delete a test account** end-to-end
- [ ] Submit for review with the demo account + notes above
