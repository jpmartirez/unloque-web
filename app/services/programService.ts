import { db } from "@/utils/firebase";
import {
	collection,
	doc,
	getDocs,
	getDoc,
	addDoc,
	updateDoc,
	deleteDoc,
	serverTimestamp,
	query,
	where,
	collectionGroup,
} from "firebase/firestore";
import type { Program } from "@/app/types/program";
import type { DetailSection } from "@/app/types/programDetailSection";
import type { FormField } from "@/app/types/applicationForm";

const COL = "programs";

// ─── Programs ────────────────────────────────────────────────

export const getPrograms = async (): Promise<Program[]> => {
	// Use collectionGroup to search ALL subcollections named "programs"
	const snapshot = await getDocs(collectionGroup(db, COL));
	return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Program);
};

export const getProgramsByStatus = async (
	status: Program["_programStatus"],
): Promise<Program[]> => {
	const q = query(collection(db, COL), where("_programStatus", "==", status));
	const snapshot = await getDocs(q);
	return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Program);
};

export const getProgramsByOrg = async (
	organizationId: string,
): Promise<Program[]> => {
	const q = query(
		collection(db, COL),
		where("organizationId", "==", organizationId),
	);
	const snapshot = await getDocs(q);
	return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Program);
};

export const getProgram = async (id: string): Promise<Program | null> => {
	const snap = await getDoc(doc(db, COL, id));
	return snap.exists() ? ({ id: snap.id, ...snap.data() } as Program) : null;
};

export const createProgram = async (
	data: Omit<Program, "id" | "createdAt" | "lastUpdated">,
): Promise<string> => {
	const ref = await addDoc(collection(db, COL), {
		...data,
		createdAt: serverTimestamp(),
		lastUpdated: serverTimestamp(),
	});
	return ref.id;
};

export const updateProgram = async (
	id: string,
	data: Partial<Omit<Program, "id" | "createdAt">>,
): Promise<void> => {
	await updateDoc(doc(db, COL, id), {
		...data,
		lastUpdated: serverTimestamp(),
	});
};

export const deleteProgram = async (id: string): Promise<void> => {
	await deleteDoc(doc(db, COL, id));
};

// ─── Detail Sections (subcollection) ─────────────────────────

export const getDetailSections = async (
	programId: string,
): Promise<DetailSection[]> => {
	const snapshot = await getDocs(
		collection(db, COL, programId, "detailSections"),
	);
	return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as DetailSection);
};

export const createDetailSection = async (
	programId: string,
	data: Omit<DetailSection, "id">,
): Promise<string> => {
	const ref = await addDoc(
		collection(db, COL, programId, "detailSections"),
		data,
	);
	return ref.id;
};

export const updateDetailSection = async (
	programId: string,
	sectionId: string,
	data: Partial<Omit<DetailSection, "id">>,
): Promise<void> => {
	await updateDoc(doc(db, COL, programId, "detailSections", sectionId), data);
};

export const deleteDetailSection = async (
	programId: string,
	sectionId: string,
): Promise<void> => {
	await deleteDoc(doc(db, COL, programId, "detailSections", sectionId));
};

// ─── Form Fields (subcollection) ──────────────────────────────

export const getFormFields = async (
	programId: string,
): Promise<FormField[]> => {
	const snapshot = await getDocs(collection(db, COL, programId, "formFields"));
	return snapshot.docs
		.map((d) => ({ id: d.id, ...d.data() }) as FormField)
		.sort((a, b) => a.order - b.order);
};

export const createFormField = async (
	programId: string,
	data: Omit<FormField, "id">,
): Promise<string> => {
	const ref = await addDoc(collection(db, COL, programId, "formFields"), data);
	return ref.id;
};

export const updateFormField = async (
	programId: string,
	fieldId: string,
	data: Partial<Omit<FormField, "id">>,
): Promise<void> => {
	await updateDoc(doc(db, COL, programId, "formFields", fieldId), data);
};

export const deleteFormField = async (
	programId: string,
	fieldId: string,
): Promise<void> => {
	await deleteDoc(doc(db, COL, programId, "formFields", fieldId));
};
