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

export interface NewsItem {
	id: string;
	headline: string;
	category: string;
	date: string;
	imageUrl: string;
	newsUrl: string;
	createdAt?: any;
}

// Add this to your programService.ts
export const getNewsByOrg = async (orgId: string): Promise<NewsItem[]> => {
	// Point directly to the organization's main news folder
	const newsRef = collection(db, "organizations", orgId, "news");
	const snapshot = await getDocs(newsRef);

	// Map through the documents and return them
	return snapshot.docs.map(
		(d) =>
			({
				id: d.id,
				...d.data(),
			}) as NewsItem,
	);
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
