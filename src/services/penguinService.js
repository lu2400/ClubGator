import {
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";

export async function createPenguin() {
  await auth.authStateReady();

  const user = auth.currentUser;

  if (!user) {
    throw new Error("You must be logged in to create a penguin.");
  }

  const profileRef = doc(db, "users", user.uid);
  const penguinRef = doc(db, "penguins", user.uid);

  return runTransaction(db, async (transaction) => {
    const profileSnapshot = await transaction.get(profileRef);
    const penguinSnapshot = await transaction.get(penguinRef);

    if (!profileSnapshot.exists()) {
      throw new Error("Finish creating your account first.");
    }

    // repeated submissions return the existing penguin.
    if (penguinSnapshot.exists()) {
      return penguinSnapshot.data();
    }

    const penguin = {
      ownerId: user.uid,
      appearance: {},
      createdAt: serverTimestamp(),
      schemaVersion: 1,
    };

    transaction.set(penguinRef, penguin);

    return penguin;
  });
}