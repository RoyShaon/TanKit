import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCcc65AipHrXr1TojZxbRP92DLj9z_Vqfc",
  authDomain: "tankit-678cd.firebaseapp.com",
  projectId: "tankit-678cd",
  storageBucket: "tankit-678cd.appspot.com",
  messagingSenderId: "53225238956",
  appId: "1:53225238956:web:495dcb4dc24e68c1154a09",
  measurementId: "G-T55GX90MLN"
};

let app: FirebaseApp;
let analytics: Analytics | null = null;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  if (typeof window !== "undefined") {
    analytics = getAnalytics(app);
  }
} else {
  app = getApps()[0];
}

export { app, analytics };
