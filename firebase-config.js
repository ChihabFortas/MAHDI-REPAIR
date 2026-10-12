// Paste your Firebase web app config here (Firebase console > Project settings > Your apps)
export const firebaseConfig = {
  apiKey: "AIzaSyDWtdRlfk87KnlsKofg08db_pUwVKq6YFE",
  authDomain: "mahdi-repair.firebaseapp.com",
  projectId: "mahdi-repair",
  appId: "1:516189596370:web:1119db4e0d2b6dcd12db0b"
};
// Shop details printed on receipts. trackUrl = public address of track.html on GitHub Pages
export const SHOP = {
  name: "Mahdi Repair",
  phone: "+562 71 63 04",
  trackUrl: "https://chihabfortas.github.io/MAHDI-REPAIR/track.html"
};
// Bootstrap owner emails: on first sign-in these accounts become admin automatically.
// Also put the same email(s) in the isOwner() list of firestore.rules.
export const ADMINS = ["asterphinix141@gmail.com"];

// Staff are signed out after this many idle minutes
export const IDLE_MINUTES = 30;
