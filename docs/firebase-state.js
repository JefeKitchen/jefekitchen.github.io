import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import {
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const householdId = "jefes-kitchen";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const plansCollection = collection(db, "households", householdId, "plans");

function normalizePlan(docSnap) {
  const data = docSnap.data() || {};
  return {
    id: data.recipeId || docSnap.id,
    recipeId: data.recipeId || docSnap.id,
    day: data.day || "",
    date: data.date || ""
  };
}

async function ensureSignedIn() {
  if (auth.currentUser) return auth.currentUser;
  const credential = await signInAnonymously(auth);
  return credential.user;
}

function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

function watchPlans(callback, onError) {
  return onSnapshot(
    plansCollection,
    snapshot => callback(snapshot.docs.map(normalizePlan)),
    error => {
      console.warn("Kitchen sync unavailable", error);
      if (onError) onError(error);
    }
  );
}

function savePlan(entry) {
  return setDoc(doc(plansCollection, entry.id), {
    recipeId: entry.id,
    day: entry.day || "",
    date: entry.date || "",
    updatedAt: serverTimestamp()
  });
}

function removePlan(recipeId) {
  return deleteDoc(doc(plansCollection, recipeId));
}

window.KitchenCloud = {
  ensureSignedIn,
  watchAuth,
  watchPlans,
  savePlan,
  removePlan,
  isSignedIn: () => !!auth.currentUser
};

window.dispatchEvent(new CustomEvent("kitchen-cloud-ready"));
ensureSignedIn().catch(error => {
  console.warn("Kitchen sync sign-in unavailable", error);
});
