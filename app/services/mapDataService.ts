import {
	collection,
	doc,
	getDocs,
	getDoc,
	updateDoc,
	deleteDoc,
	query,
	where,
	addDoc,
	serverTimestamp,
} from "firebase/firestore";
import { db } from "@/utils/firebase";

// Fetch map data only for the logged-in organization
export const getMapDataByOrg = async (orgId: string) => {
	const q = query(
		collection(db, "mapdata"),
		where("organizationId", "==", orgId),
	);
	const snapshot = await getDocs(q);
	return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Fetch a single map data document
export const getMapDataById = async (id: string) => {
	const docRef = doc(db, "mapdata", id);
	const snap = await getDoc(docRef);
	return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// Delete a map data document
export const deleteMapData = async (id: string) => {
	await deleteDoc(doc(db, "mapdata", id));
};

// Update map data (used for both renaming the program AND updating municipality counts)
export const updateMapData = async (id: string, data: any) => {
	const docRef = doc(db, "mapdata", id);
	await updateDoc(docRef, {
		...data,
		updatedAt: serverTimestamp(),
	});
};

// Create new map data (For the "Add Data" button)
export const createMapData = async (data: any) => {
	// This creates a new document inside the "mapdata" collection
	const docRef = await addDoc(collection(db, "mapdata"), {
		...data,
		updatedAt: serverTimestamp(), // Automatically saves the exact time it was created
	});

	return docRef.id;
};
