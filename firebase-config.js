// Paste your Firebase web app config here (Firebase console > Project settings > Your apps)
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  appId: "YOUR_APP_ID"
};
// Shop details printed on receipts. trackUrl = public address of track.html on GitHub Pages
export const SHOP = {
  name: "Mahdi Repair",
  phone: "+000 000 000",
  trackUrl: "https://YOUR-USER.github.io/YOUR-REPO/track.html"
};
// Bootstrap owner emails: on first sign-in these accounts become admin automatically.
// Also put the same email(s) in the isOwner() list of firestore.rules.
export const ADMINS = ["owner@example.com"];

// Staff are signed out after this many idle minutes
export const IDLE_MINUTES = 30;
