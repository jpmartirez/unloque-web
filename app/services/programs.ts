import { db } from "@/utils/firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import type { Program } from "@/app/types/program";
import type { DetailSection } from "@/app/types/programDetailSection";
import type { FormField } from "@/app/types/applicationForm";

// Get all programs
export const getPrograms = async (): Promise<Program[]> => {
  const snapshot = await getDocs(collection(db, "programs"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Program);
};

// Get programs by status
export const getProgramsByStatus = async (
  status: Program["_programStatus"],
) => {
  const q = query(
    collection(db, "programs"),
    where("_programStatus", "==", status),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Program);
};

// Get detail sections of a program
export const getDetailSections = async (
  programId: string,
): Promise<DetailSection[]> => {
  const snapshot = await getDocs(
    collection(db, "programs", programId, "detailSections"),
  );
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as DetailSection,
  );
};

// Get form fields of a program (sorted by order)
export const getFormFields = async (
  programId: string,
): Promise<FormField[]> => {
  const snapshot = await getDocs(
    collection(db, "programs", programId, "formFields"),
  );
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as FormField)
    .sort((a, b) => a.order - b.order);
};
