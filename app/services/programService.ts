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

// Add to your types at the top or in a separate types file
export interface NewsItem {
	id: string;
	headline: string;
	category: string;
	date: string;
	imageUrl: string;
	newsUrl: string;
	createdAt?: any;
}

// Add these functions to programService.ts

export const getAllNews = async (): Promise<
	(NewsItem & { programId: string })[]
> => {
	// 1. Search across ALL subcollections named "news"
	const q = query(collectionGroup(db, "news"));
	const snapshot = await getDocs(q);

	return snapshot.docs.map((d) => {
		
		const extractedProgramId = d.ref.parent.parent?.id || "";

		return {
			id: d.id,
			programId: extractedProgramId, 
			...d.data(),
		} as NewsItem & { programId: string };
	});
};

export const getSingleNews = async (
	newsId: string,
): Promise<NewsItem | null> => {
	const q = query(collectionGroup(db, "news"));
	const snapshot = await getDocs(q);

	const matchedDoc = snapshot.docs.find((d) => d.id === newsId);
	return matchedDoc
		? ({ id: matchedDoc.id, ...matchedDoc.data() } as NewsItem)
		: null;
};

// Update an existing news item using ONLY the newsId
export const updateNews = async (
	newsId: string,
	data: Partial<NewsItem>,
): Promise<void> => {
	const q = query(collectionGroup(db, "news"));
	const snapshot = await getDocs(q);
	const matchedDoc = snapshot.docs.find((d) => d.id === newsId);

	if (matchedDoc) {
		// matchedDoc.ref is the magic Firebase property that contains the exact full path!
		await updateDoc(matchedDoc.ref, data);
	} else {
		throw new Error("News article not found.");
	}
};

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
