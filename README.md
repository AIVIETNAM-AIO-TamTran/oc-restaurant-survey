# OC Restaurant Survey Checklist

Field-survey checklist for 40 Vietnamese restaurants across Little Saigon & Garden Grove, CA. Tap a stop to cycle Not visited → Visited → Skipped, add notes per stop, and track progress by neighborhood.

Live site (after Pages is enabled): `https://AIVIETNAM-AIO-TamTran.github.io/oc-restaurant-survey/`

## Progress sync (cross-device)

Progress always saves instantly to the browser's local storage. To have it follow you across your phone and laptop, sign in with Google (button top-right) — this requires a one-time Firebase setup:

1. Go to [Firebase Console](https://console.firebase.google.com/) → **Add project** (free Spark plan is enough).
2. In the project, go to **Build → Authentication → Get started → Sign-in method** and enable **Google**.
3. Go to **Build → Firestore Database → Create database** (start in production mode, pick any region).
4. In Firestore → **Rules**, paste the contents of [`firestore.rules`](firestore.rules) from this repo and publish.
5. Go to **Project settings** (gear icon) → scroll to **Your apps** → click the web icon `</>` → register an app (nickname anything, no need for hosting) → copy the `firebaseConfig` object it gives you.
6. Paste those values into [`src/firebaseConfig.js`](src/firebaseConfig.js) in this repo, replacing the placeholders.
7. In **Authentication → Settings → Authorized domains**, add `aivietnam-aio-tamtran.github.io` (your GitHub Pages domain) so sign-in works on the live site.
8. Commit and push — the GitHub Action rebuilds and redeploys automatically.

Without this setup the app still works fully, just saved locally per browser/device instead of synced.

## Local development

```bash
npm install
npm run dev
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the Vite app and publishes `dist/` to GitHub Pages. One-time setup: in the GitHub repo, go to **Settings → Pages → Build and deployment → Source: GitHub Actions**.
