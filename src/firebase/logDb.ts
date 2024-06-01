import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { firebaseDb } from "..";

export const log = async (telegram_id: string, data: string): Promise<void> => {
  const logRef = collection(firebaseDb, "logs");
  const lastLog = query(logRef, orderBy("id", "desc"), limit(1));

  const lastLogSnapshot = await getDocs(lastLog);
  if (lastLogSnapshot.empty) {
    await addDoc(logRef, {
      id: 0,
      telegram_id,
      data,
    });
    return;
  }

  await addDoc(logRef, {
    id: lastLogSnapshot.docs[0].data().id + 1,
    telegram_id,
    data,
  });
};

export const getAllLogs = async () => {
  const logRef = collection(firebaseDb, "logs");
  const snapshot = await getDocs(logRef);
  return snapshot.docs.map((doc) => doc.data());
};

export const getUsersLogs = async (telegram_id: string) => {
  const logRef = collection(firebaseDb, "logs");
  const q = query(logRef, where("telegram_id", "==", telegram_id));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data()).sort((a, b) => a.id - b.id);
};
