# Sign in with Apple — setup guide (do AFTER App Store approval)

Optional. Not required for approval because the **native iOS app only shows
email/password** (the Google button is hidden via `!isNative`), so Guideline 4.8
isn't triggered today. Adds **no extra Supabase cost** — Apple is just another
OAuth provider on the same auth system / MAU count.

⚠️ If you ever enable the Google button on native, Apple 4.8 **will** require
Sign in with Apple. Do this first in that case.

Use the **native** flow (identity token → Supabase). The web OAuth redirect does
NOT work inside the Capacitor WebView — same reason Google is native-hidden.

---

## 1. Apple Developer portal (you)
1. **Certificates, Identifiers & Profiles → Identifiers → your App ID** (the app's
   bundle ID) → enable the **Sign in with Apple** capability → Save.
2. **Identifiers → "+" → Services IDs** → create one (e.g. `app.armtrack.signin`).
   This is the **client_id** Supabase calls the "Services ID". Enable Sign in with
   Apple on it; under Configure, set the return URL to your Supabase callback:
   `https://trjazxklaraausqtbwkg.supabase.co/auth/v1/callback`.
3. **Keys → "+"** → enable **Sign in with Apple** → register → **download the .p8
   key** (you only get to download once). Note the **Key ID** and your **Team ID**.

## 2. Supabase dashboard (you)
**Authentication → Providers → Apple → Enable**, then fill:
- **Client IDs:** your app bundle ID **and** the Services ID from step 1.2
  (comma-separated). The native flow validates against the bundle ID.
- **Secret Key (for OAuth):** generated from Team ID + Key ID + the .p8 key +
  Services ID. Supabase's Apple provider page links a generator, or use their CLI.
- Save.

## 3. Xcode (you, in the project)
Target **App → Signing & Capabilities → "+ Capability" → Sign in with Apple.**
This writes the entitlement. Re-run `npx cap sync ios` is not needed for the
entitlement, but commit the `.entitlements` change.

## 4. Code (Claude can do this part)
Install the native plugin:
```bash
npm i @capacitor-community/apple-sign-in
npx cap sync ios
```

Add the handler (login + signup pages). Native only — gate with `isNative` the
same way Google is gated, but **inverted**: show Apple on native, Google on web.

```ts
import { SignInWithApple } from "@capacitor-community/apple-sign-in";

async function handleAppleLogin() {
  // A nonce ties the Apple token to this request; Supabase verifies it.
  const rawNonce = crypto.randomUUID();
  const hashedNonce = await sha256Hex(rawNonce); // helper below

  const result = await SignInWithApple.authorize({
    clientId: "app.armtrack.signin",          // the Services ID
    redirectURI: "https://armtrack.app/auth/callback",
    scopes: "name email",
    nonce: hashedNonce,
  });

  const idToken = result.response.identityToken;
  if (!idToken) throw new Error("No Apple identity token");

  const { error } = await supabase.auth.signInWithIdToken({
    provider: "apple",
    token: idToken,
    nonce: rawNonce,                            // raw, not hashed
  });
  if (error) throw error;
  router.replace("/dashboard");
}

async function sha256Hex(input: string) {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
```

Button (use Apple's required black/white "Sign in with Apple" style — Apple
rejects custom-styled buttons):
```tsx
{isNative && (
  <button onClick={handleAppleLogin} className="...official Apple button style...">
     Sign in with Apple
  </button>
)}
```

## 5. Gotchas
- Apple only returns the user's **name on the very first authorization**. Capture
  it then (store to `profiles.first_name`) — subsequent sign-ins won't include it.
- Apple email may be a **private relay** address (`@privaterelay.appleid.com`).
  Treat it as a normal email; don't assume it's deliverable from your own SMTP.
- Test on a **real device** (Apple sign-in is unreliable in the Simulator).
- The button must follow Apple's HIG styling or review will flag it.
