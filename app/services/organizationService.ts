import { db } from "@/utils/firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import type { Organization } from "@/app/types/organizations";

const COL = "organizations";

export const getOrganizations = async (): Promise<Organization[]> => {
  const snapshot = await getDocs(collection(db, COL));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Organization);
};

export const getOrganization = async (
  id: string,
): Promise<Organization | null> => {
  const snap = await getDoc(doc(db, COL, id));
  return snap.exists()
    ? ({ id: snap.id, ...snap.data() } as Organization)
    : null;
};

export const createOrganization = async (
  data: Omit<Organization, "id">,
): Promise<string> => {
  const ref = await addDoc(collection(db, COL), data);
  return ref.id;
};

export const updateOrganization = async (
  id: string,
  data: Partial<Omit<Organization, "id">>,
): Promise<void> => {
  await updateDoc(doc(db, COL, id), data);
};

export const deleteOrganization = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COL, id));
};
