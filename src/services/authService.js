import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";

function registrationError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

export async function registerPlayer({ username, email, password }) {
  const cleanUsername = username.trim();
  const cleanEmail = email.trim();
  const usernameKey = cleanUsername.toLowerCase();

  if (!/^[A-Za-z0-9_]{3,16}$/.test(cleanUsername)) {
    throw registrationError(
      "registration/invalid-username",
      "Use 3–16 letters, numbers, or underscores."
    );
  }

  await auth.authStateReady();

  //reuse the signed-in account if an earlier profile save failed.
  let user = auth.currentUser;

  if (user?.email?.toLowerCase() !== cleanEmail.toLowerCase()) {
    const credential = await createUserWithEmailAndPassword(
      auth,
      cleanEmail,
      password
    );

    user = credential.user;
  }

  const profileRef = doc(db, "users", user.uid);
  const usernameRef = doc(db, "usernames", usernameKey);

  const profile = await runTransaction(db, async (transaction) => {
    const existingProfile = await transaction.get(profileRef);

    if (existingProfile.exists()) {
      const savedProfile = existingProfile.data();

      //a repeated submission can safely return the saved result.
      if (savedProfile.usernameKey === usernameKey) {
        return savedProfile;
      }

      throw registrationError(
        "registration/profile-exists",
        "This account already has a profile. Please log in."
      );
    }

    const existingUsername = await transaction.get(usernameRef);

    if (existingUsername.exists()) {
      throw registrationError(
        "registration/username-taken",
        "That username is taken. Choose another."
      );
    }

    const newProfile = {
      username: cleanUsername,
      usernameKey,
      role: "player",
      createdAt: serverTimestamp(),
    };

    transaction.set(usernameRef, { uid: user.uid });
    transaction.set(profileRef, newProfile);

    return newProfile;
  });

  return { user, profile };
}