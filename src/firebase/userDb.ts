import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import moment from "moment";
import { log } from "./logDb";
import { firebaseDb } from "..";

export const getUsers = async () => {
  const userRef = collection(firebaseDb, "users");

  const snapshot = await getDocs(userRef);
  return snapshot.docs.map((doc) => doc.data());
};

export const getUser = async (telegram_id: string) => {
  const userRef = collection(firebaseDb, "users");

  const q = query(userRef, where("telegram_id", "==", telegram_id));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => doc.data())[0];
};

export const getUserByName = async (name: string) => {
  const userRef = collection(firebaseDb, "users");

  const q = query(userRef, where("name", "==", name));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => doc.data())[0];
};

export const addPasses = async (telegram_id: string, num_passes: number) => {
  const userCollection = collection(firebaseDb, "users");
  const q = query(userCollection, where("telegram_id", "==", telegram_id));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const docRef = snapshot.docs[0].ref;
    const remainingPasses = snapshot.docs[0].data().passes_remaining;

    await updateDoc(docRef, {
      passes_remaining: remainingPasses + num_passes,
    });

    const now = moment().format("DD/MM/YYYY").toString();
    await log(
      telegram_id,
      `Added ${num_passes.toString()} pass(es) on ${now} (${
        remainingPasses + num_passes
      } remaining)`
    );

    return remainingPasses + num_passes;
  } else {
    console.log("User not found");
  }
};

export const getStats = async () => {
  const userRef = collection(firebaseDb, "users");
  let data = "";
  const snapshot = await getDocs(userRef);
  const users = snapshot.docs.map((doc) => doc.data());
  users.sort((a, b) => b.passes_remaining - a.passes_remaining);

  users.forEach((user) => {
    data += `${user.name}: ${user.passes_remaining}\n`;
  });

  return data;
};

export const usePasses = async (
  telegram_id: string,
  num_passes_used: number,
  lending?: boolean,
  borrower_id?: string
) => {
  console.log("telegram_id:", telegram_id);
  console.log("num_passes_used:", num_passes_used);
  console.log("lending:", lending);
  console.log("borrower_id:", borrower_id);

  const userCollection = collection(firebaseDb, "users");
  const q = query(userCollection, where("telegram_id", "==", telegram_id));
  const user = await getUser(telegram_id);
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const docRef = snapshot.docs[0].ref;
    const remainingPasses = snapshot.docs[0].data().passes_remaining;

    if (remainingPasses < num_passes_used) {
      console.log("Not enough passes");
      return;
    }

    await updateDoc(docRef, {
      passes_remaining: remainingPasses - num_passes_used,
    });

    const now = moment().format("DD/MM/YYYY").toString();
    if (lending) {
      const borrower = await getUser(borrower_id);
      console.log(borrower);
      await log(
        borrower.telegram_id,
        `${
          user.name
        } lent you ${num_passes_used.toString()} pass(es) on ${now}!`
      );
    } else {
      await log(
        telegram_id,
        `Used ${num_passes_used.toString()} pass(es) on ${now} (${
          remainingPasses - num_passes_used
        } remaining)`
      );
    }

    return remainingPasses - num_passes_used;
  } else {
    console.log("User not found");
  }
};
