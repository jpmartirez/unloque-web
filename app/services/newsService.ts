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
	serverTimestamp,
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

// Function to create a new news article
export const createNews = async (
	orgId: string,
	data: Partial<NewsItem & { programId: string }>,
): Promise<string> => {
	// Point directly to organizations/{orgId}/news
	const newsRef = collection(db, "organizations", orgId, "news");

	const docRef = await addDoc(newsRef, {
		...data,
		createdAt: serverTimestamp(),
	});

	return docRef.id;
};

export const updateNews = async (
	id: string,
	data: Partial<Omit<News, "id">>,
): Promise<void> => {
	await updateDoc(doc(db, COL, id), data);
};

export const deleteNews = async (orgId: string, newsId: string) => {
	const docRef = doc(db, "organizations", orgId, "news", newsId);
	await deleteDoc(docRef);
};
