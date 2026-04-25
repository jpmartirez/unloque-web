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

const COL = "programs";

// ─── READ OPERATIONS ─────────────────────────────────────────

export const getPrograms = async (): Promise<Program[]> => {
	// collectionGroup tells Firebase to search EVERY folder named "programs"
	const snapshot = await getDocs(collectionGroup(db, COL));
	return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Program);
};

// Add this at the bottom of programService.ts
export const getOrganization = async (orgId: string) => {
	const orgRef = doc(db, "organizations", orgId);
	const orgSnap = await getDoc(orgRef);

	return orgSnap.exists() ? orgSnap.data() : null;
};

export const getProgramsByStatus = async (
	status: Program["programStatus"],
): Promise<Program[]> => {
	const q = query(
		collectionGroup(db, COL),
		where("programStatus", "==", status),
	);
	const snapshot = await getDocs(q);
	return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Program);
};

export const getProgramsByOrg = async (
	organizationId: string,
): Promise<Program[]> => {
	// Look specifically inside the organization's programs folder
	const orgProgramsRef = collection(
		db,
		"organizations",
		organizationId,
		"programs",
	);
	const snapshot = await getDocs(orgProgramsRef);
	return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Program);
};

export const getProgram = async (id: string): Promise<Program | null> => {
	// 1. Search across ALL subcollections named "programs"
	const q = query(collectionGroup(db, COL));
	const snapshot = await getDocs(q);

	// 2. Find the specific document where the ID matches the one from the URL
	const matchedDoc = snapshot.docs.find((d) => d.id === id);

	// 3. Return it if found, otherwise return null
	return matchedDoc
		? ({ id: matchedDoc.id, ...matchedDoc.data() } as Program)
		: null;
};

// ─── WRITE OPERATIONS ────────────────────────────────────────

export const createProgram = async (
	data: Omit<Program, "id" | "createdAt" | "lastUpdated">,
): Promise<string> => {
	// IMPORTANT: We use data.organizationId to put it in the right folder!
	const orgProgramsRef = collection(
		db,
		"organizations",
		data.organizationId,
		"programs",
	);

	const ref = await addDoc(orgProgramsRef, {
		...data,
		createdAt: serverTimestamp(),
		lastUpdated: serverTimestamp(),
	});
	return ref.id;
};

export const updateProgram = async (
	orgId: string, // <-- Added orgId
	id: string,
	data: Partial<Omit<Program, "id" | "createdAt">>,
): Promise<void> => {
	// Construct the exact path: organizations/{orgId}/programs/{id}
	const programRef = doc(db, "organizations", orgId, "programs", id);

	await updateDoc(programRef, {
		...data,
		lastUpdated: serverTimestamp(),
	});
};

export const deleteProgram = async (
	orgId: string, // <-- Added orgId
	id: string,
): Promise<void> => {
	const programRef = doc(db, "organizations", orgId, "programs", id);
	await deleteDoc(programRef);
};
