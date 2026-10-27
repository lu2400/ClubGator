import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { campusLandmarks } from "../data/landmarks";

const landmarksCollection = "landmarks";

export async function seedLandmarksIfEmpty() {
  const colRef = collection(db, landmarksCollection);
  const snapshot = await getDocs(colRef);

  if (snapshot.empty) {
    for (const landmark of campusLandmarks) {
      await setDoc(doc(db, landmarksCollection, landmark.id), landmark);
    }
    return campusLandmarks;
  }

  return snapshot.docs.map((d) => d.data());
}

export async function getLandmarks() {
  const colRef = collection(db, landmarksCollection);
  const snapshot = await getDocs(colRef);

  if (snapshot.empty) {
    return await seedLandmarksIfEmpty();
  }

  return snapshot.docs.map((d) => d.data());
}