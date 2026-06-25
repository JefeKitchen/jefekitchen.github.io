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
const shoppingRecipesCollection = collection(db, "households", householdId, "shoppingRecipes");
const shoppingItemsCollection = collection(db, "households", householdId, "shoppingItems");
const purchasedItemsCollection = collection(db, "households", householdId, "purchasedItems");
const pollVotesCollection = collection(db, "households", householdId, "polls", "current", "votes");

function normalizePlan(docSnap) {
  const data = docSnap.data() || {};
  return {
    id: data.recipeId || docSnap.id,
    recipeId: data.recipeId || docSnap.id,
    day: data.day || "",
    date: data.date || "",
    meal: data.meal || ""
  };
}

function normalizeShoppingRecipe(docSnap) {
  const data = docSnap.data() || {};
  return {
    id: data.recipeId || docSnap.id,
    recipeId: data.recipeId || docSnap.id,
    day: data.day || "",
    date: data.date || "",
    meal: data.meal || ""
  };
}

function normalizeShoppingItem(docSnap) {
  const data = docSnap.data() || {};
  return {
    id: data.id || docSnap.id,
    requestedSection: data.requestedSection || data.section || "Misc",
    section: data.section || "Misc",
    text: data.text || ""
  };
}

function normalizePollVote(docSnap) {
  const data = docSnap.data() || {};
  return {
    voterId: docSnap.id,
    choiceId: data.choiceId || "",
    choice: data.choice || "",
    writeIn: !!data.writeIn
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

function watchShopping(callback, onError) {
  const state = {
    recipes: [],
    customItems: [],
    purchasedItems: []
  };
  let readyCount = 0;

  const emit = () => callback({ ...state });
  const markReady = () => {
    readyCount += 1;
    if (readyCount >= 3) emit();
  };
  const fail = error => {
    console.warn("Kitchen shopping sync unavailable", error);
    if (onError) onError(error);
  };

  const unwatchRecipes = onSnapshot(
    shoppingRecipesCollection,
    snapshot => {
      state.recipes = snapshot.docs.map(normalizeShoppingRecipe);
      readyCount >= 3 ? emit() : markReady();
    },
    fail
  );
  const unwatchItems = onSnapshot(
    shoppingItemsCollection,
    snapshot => {
      state.customItems = snapshot.docs.map(normalizeShoppingItem).filter(item => item.text);
      readyCount >= 3 ? emit() : markReady();
    },
    fail
  );
  const unwatchPurchased = onSnapshot(
    purchasedItemsCollection,
    snapshot => {
      state.purchasedItems = snapshot.docs.map(docSnap => docSnap.id);
      readyCount >= 3 ? emit() : markReady();
    },
    fail
  );

  return () => {
    unwatchRecipes();
    unwatchItems();
    unwatchPurchased();
  };
}

function watchPollVotes(callback, onError) {
  return onSnapshot(
    pollVotesCollection,
    snapshot => callback(snapshot.docs.map(normalizePollVote)),
    error => {
      console.warn("Kitchen poll sync unavailable", error);
      if (onError) onError(error);
    }
  );
}

function savePlan(entry) {
  return setDoc(doc(plansCollection, entry.id), {
    recipeId: entry.id,
    day: entry.day || "",
    date: entry.date || "",
    meal: entry.meal || "",
    updatedAt: serverTimestamp()
  });
}

function removePlan(recipeId) {
  return deleteDoc(doc(plansCollection, recipeId));
}

function saveShoppingRecipe(entry) {
  return setDoc(doc(shoppingRecipesCollection, entry.id), {
    recipeId: entry.id,
    day: entry.day || "",
    date: entry.date || "",
    meal: entry.meal || "",
    updatedAt: serverTimestamp()
  });
}

function removeShoppingRecipe(recipeId) {
  return deleteDoc(doc(shoppingRecipesCollection, recipeId));
}

function saveShoppingItem(item) {
  return setDoc(doc(shoppingItemsCollection, item.id), {
    id: item.id,
    requestedSection: item.requestedSection || item.section || "Misc",
    section: item.section || "Misc",
    text: item.text || "",
    updatedAt: serverTimestamp()
  });
}

function removeShoppingItem(itemId) {
  return deleteDoc(doc(shoppingItemsCollection, itemId));
}

function markPurchased(itemId) {
  return setDoc(doc(purchasedItemsCollection, itemId), {
    id: itemId,
    updatedAt: serverTimestamp()
  });
}

function clearPurchasedItem(itemId) {
  return deleteDoc(doc(purchasedItemsCollection, itemId));
}

async function savePollVote(vote) {
  const user = await ensureSignedIn();
  return setDoc(doc(pollVotesCollection, user.uid), {
    choiceId: vote.choiceId || "",
    choice: vote.choice || "",
    writeIn: !!vote.writeIn,
    updatedAt: serverTimestamp()
  });
}

function currentUserId() {
  return auth.currentUser?.uid || "";
}

window.KitchenCloud = {
  ensureSignedIn,
  watchAuth,
  watchPlans,
  watchShopping,
  watchPollVotes,
  savePlan,
  removePlan,
  saveShoppingRecipe,
  removeShoppingRecipe,
  saveShoppingItem,
  removeShoppingItem,
  markPurchased,
  clearPurchasedItem,
  savePollVote,
  currentUserId,
  isSignedIn: () => !!auth.currentUser
};

window.dispatchEvent(new CustomEvent("kitchen-cloud-ready"));
ensureSignedIn().catch(error => {
  console.warn("Kitchen sync sign-in unavailable", error);
});
