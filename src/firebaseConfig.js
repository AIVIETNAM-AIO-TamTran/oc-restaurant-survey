// Fill these in with your own Firebase project's web app config.
// Firebase Console → Project settings → General → "Your apps" → Web app → SDK setup and configuration.
// These values are safe to be public in client code — access is controlled by
// the Firestore security rules (see firestore.rules) and Firebase Auth, not by secrecy of this config.
export const firebaseConfig = {
  apiKey: "AIzaSyBEWSF1iOkHU86uJ0aOvS6osGN5dV8AeA8",
  authDomain: "oc-restaurant.firebaseapp.com",
  projectId: "oc-restaurant",
  storageBucket: "oc-restaurant.firebasestorage.app",
  messagingSenderId: "934458755892",
  appId: "1:934458755892:web:6995717ea62a337fda7361",
};

export const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";
