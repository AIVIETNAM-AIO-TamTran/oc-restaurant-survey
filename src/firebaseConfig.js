// Fill these in with your own Firebase project's web app config.
// Firebase Console → Project settings → General → "Your apps" → Web app → SDK setup and configuration.
// These values are safe to be public in client code — access is controlled by
// the Firestore security rules (see firestore.rules) and Firebase Auth, not by secrecy of this config.
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

export const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";
