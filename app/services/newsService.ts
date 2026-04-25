import { db } from "@/utils/firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import type { News } from "@/app/types/news";

const COL = "news";

export const getAllNews = async (): Promise<News[]> => {
  const q = query(collection(db, COL), orderBy("_date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as News);
};

export const getNewsByCategory = async (category: string): Promise<News[]> => {
  const q = query(
    collection(db, COL),
    where("_category", "==", category),
    orderBy("_date", "desc"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as News);
};

export const getNewsArticle = async (id: string): Promise<News | null> => {
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as News) : null;
};

export const createNews = async (data: Omit<News, "id">): Promise<string> => {
  const ref = await addDoc(collection(db, COL), data);
  return ref.id;
};

export const updateNews = async (
  id: string,
  data: Partial<Omit<News, "id">>,
): Promise<void> => {
  await updateDoc(doc(db, COL, id), data);
};

export const deleteNews = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COL, id));
};
