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
} from "firebase/firestore";
import type { Application } from "@/app/types/application";
import type { FormResponse } from "@/app/types/response";
import type { UploadedFile } from "@/app/types/uploadedFiles";

const COL = "applications";

// ─── Applications ─────────────────────────────────────────────

export const getApplications = async (): Promise<Application[]> => {
	const snapshot = await getDocs(collection(db, COL));
	return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Application);
};

export const getApplicationsByUser = async (
	userId: string,
): Promise<Application[]> => {
	const q = query(collection(db, COL), where("userId", "==", userId));
	const snapshot = await getDocs(q);
	return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Application);
};

export const getApplicationsByProgram = async (
	programId: string,
): Promise<Application[]> => {
	const q = query(collection(db, COL), where("programId", "==", programId));
	const snapshot = await getDocs(q);
	return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Application);
};

export const getApplication = async (
	id: string,
): Promise<Application | null> => {
	const snap = await getDoc(doc(db, COL, id));
	return snap.exists()
		? ({ id: snap.id, ...snap.data() } as Application)
		: null;
};

export const createApplication = async (
	data: Omit<Application, "id" | "submittedAt" | "lastUpdated">,
): Promise<string> => {
	const ref = await addDoc(collection(db, COL), {
		...data,
		submittedAt: serverTimestamp(),
		lastUpdated: serverTimestamp(),
	});
	return ref.id;
};

export const updateApplicationStatus = async (
	id: string,
	status: Application["_status"],
): Promise<void> => {
	await updateDoc(doc(db, COL, id), {
		_status: status,
		lastUpdated: serverTimestamp(),
	});
};

export const deleteApplication = async (id: string): Promise<void> => {
	await deleteDoc(doc(db, COL, id));
};

// ─── Form Responses (subcollection) ───────────────────────────

export const getResponses = async (
	applicationId: string,
): Promise<FormResponse[]> => {
	const snapshot = await getDocs(
		collection(db, COL, applicationId, "responses"),
	);
	return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as FormResponse);
};

export const saveResponse = async (
	applicationId: string,
	data: Omit<FormResponse, "id">,
): Promise<string> => {
	const ref = await addDoc(
		collection(db, COL, applicationId, "responses"),
		data,
	);
	return ref.id;
};

export const updateResponse = async (
	applicationId: string,
	responseId: string,
	data: Partial<Omit<FormResponse, "id">>,
): Promise<void> => {
	await updateDoc(doc(db, COL, applicationId, "responses", responseId), data);
};

export const deleteResponse = async (
	applicationId: string,
	responseId: string,
): Promise<void> => {
	await deleteDoc(doc(db, COL, applicationId, "responses", responseId));
};

// ─── Uploaded Files (subcollection) ───────────────────────────

export const getUploadedFiles = async (
	applicationId: string,
): Promise<UploadedFile[]> => {
	const snapshot = await getDocs(collection(db, COL, applicationId, "files"));
	return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as UploadedFile);
};

export const saveUploadedFile = async (
	applicationId: string,
	data: Omit<UploadedFile, "id">,
): Promise<string> => {
	const ref = await addDoc(collection(db, COL, applicationId, "files"), data);
	return ref.id;
};

export const deleteUploadedFile = async (
	applicationId: string,
	fileId: string,
): Promise<void> => {
	await deleteDoc(doc(db, COL, applicationId, "files", fileId));
};
