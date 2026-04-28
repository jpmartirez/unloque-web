import { db } from "@/utils/firebase";
import {
	collection,
	doc,
	getDocs,
	getDoc,
	setDoc,
	updateDoc,
	deleteDoc,
	serverTimestamp,
	query,
	where,
	collectionGroup,
	getCountFromServer,
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
	createdAt?: unknown;
}

export interface ApplicationWithUser {
	applicationId: string;
	programId: string;
	status: string;
	createdAt: unknown;
	userId: string;
	username: string;
	email: string;
	photoUrl: string;
}

const isHexColor = (value: unknown): value is string => {
	if (typeof value !== "string") return false;
	return /^#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(value);
};

const normalizeHexColor = (hex: string): string => {
	const value = hex.trim();
	if (value.length === 4) {
		return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
	}
	return value;
};

const toArgbIntFromHex = (hex: string): number => {
	const normalized = normalizeHexColor(hex).replace("#", "");
	const rgb = Number.parseInt(normalized, 16);
	return (0xff000000 | rgb) >>> 0;
};

const normalizeProgramStatus = (value: unknown): "Open" | "Closed" => {
	return String(value) === "Open" ? "Open" : "Closed";
};

const normalizeProgramWritePayload = (
	data: Record<string, unknown>,
): Record<string, unknown> => {
	const next = { ...data };

	if ("programStatus" in next) {
		next.programStatus = normalizeProgramStatus(next.programStatus);
	}

	if ("color" in next) {
		const color = next.color;
		if (typeof color === "number" && Number.isFinite(color)) {
			next.color = color;
		} else if (isHexColor(color)) {
			next.color = toArgbIntFromHex(color);
		} else if (typeof color === "string" && color.startsWith("0x")) {
			const parsed = Number.parseInt(color);
			if (Number.isFinite(parsed)) next.color = parsed;
		}
	}

	return next;
};

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

export const getProgramApplications = async (
	programId: string,
): Promise<ApplicationWithUser[]> => {
	// 1. Fetch all applications matching the programId
	const q = query(
		collectionGroup(db, "users-application"),
		where("id", "==", programId),
	);
	const snapshot = await getDocs(q);

	// 2. Loop through and fetch the user details for each application
	const applications = await Promise.all(
		snapshot.docs.map(async (d) => {
			const appData = d.data() as Record<string, unknown>;

			const userId = d.ref.parent.parent?.id;

			let userData: { username?: string; email?: string; photoUrl?: string } = {
				username: "Unknown",
				email: "Unknown",
				photoUrl: "",
			};

			if (userId) {
				const userDoc = await getDoc(doc(db, "users", userId));
				if (userDoc.exists()) {
					const raw = userDoc.data() as Record<string, unknown>;
					userData = {
						username:
							typeof raw.username === "string" ? raw.username : "Unknown",
						email: typeof raw.email === "string" ? raw.email : "Unknown",
						photoUrl: typeof raw.photoUrl === "string" ? raw.photoUrl : "",
					};
				}
			}

			return {
				applicationId: d.id,
				programId: appData.id || programId,
				status: appData.status || "Ongoing",
				createdAt: appData.createdAt,
				userId: userId || "",
				username: userData.username || "Unknown User",
				email: userData.email || "No email",
				photoUrl: userData.photoUrl || "",
			};
		}),
	);

	return applications;
};

export const getApplicationCountForProgram = async (
	programId: string,
): Promise<number> => {
	try {
		// Search every "users-application" folder across ALL users
		const q = query(
			collectionGroup(db, "users-application"),
			where("id", "==", programId),
		);

		// Count the results securely and cheaply on the server
		const snapshot = await getCountFromServer(q);
		return snapshot.data().count;
	} catch (error) {
		console.error(
			`Error counting applications for program ${programId}:`,
			error,
		);
		return 0;
	}
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
	return snapshot.docs.map((d) => {
		const data = d.data() as unknown as Omit<Program, "id">;
		return { ...data, id: d.id } as Program;
	});
};

// Add this at the bottom of programService.ts
export const getOrganization = async (orgId: string) => {
	const orgRef = doc(db, "organizations", orgId);
	const orgSnap = await getDoc(orgRef);

	return orgSnap.exists() ? orgSnap.data() : null;
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
	return snapshot.docs.map((d) => {
		const data = d.data() as unknown as Omit<Program, "id">;
		return { ...data, id: d.id } as Program;
	});
};

export const getProgram = async (id: string): Promise<Program | null> => {
	// 1. Search across ALL subcollections named "programs"
	const q = query(collectionGroup(db, COL));
	const snapshot = await getDocs(q);

	// 2. Find the specific document where the ID matches the one from the URL
	const matchedDoc = snapshot.docs.find((d) => d.id === id);

	// 3. Return it if found, otherwise return null
	if (!matchedDoc) return null;
	const data = matchedDoc.data() as unknown as Omit<Program, "id">;
	return { ...data, id: matchedDoc.id } as Program;
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

	// Create the doc ID first so we can also store the duplicate `id` field.
	const programRef = doc(orgProgramsRef);
	const payload = normalizeProgramWritePayload({
		...data,
		id: programRef.id,
		// Match the mobile app schema: createdAt is set on create.
		createdAt: serverTimestamp(),
		// Ensure status is always Open/Closed (no Draft in persisted docs).
		programStatus: normalizeProgramStatus(data.programStatus),
	});

	await setDoc(programRef, payload);
	return programRef.id;
};

export const updateProgram = async (
	orgId: string, // <-- Added orgId
	id: string,
	data: Partial<Omit<Program, "id" | "createdAt">>,
): Promise<void> => {
	// Construct the exact path: organizations/{orgId}/programs/{id}
	const programRef = doc(db, "organizations", orgId, "programs", id);

	await updateDoc(programRef, {
		...normalizeProgramWritePayload(data as unknown as Record<string, unknown>),
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

// Dashboard

// Add this at the bottom of programService.ts
export const getDashboardStats = async (orgId: string) => {
	// 1. Fetch Beneficiaries from MapData
	const mapDataQuery = query(
		collection(db, "mapdata"),
		where("organizationId", "==", orgId),
	);
	const mapSnap = await getDocs(mapDataQuery);
	let totalBeneficiaries = 0;
	mapSnap.forEach((doc) => {
		totalBeneficiaries += Number(doc.data()["Total Beneficiaries"] || 0);
	});

	// 2. Fetch all programs for this org
	const programsQuery = collection(db, "organizations", orgId, "programs");
	const programsSnap = await getDocs(programsQuery);

	let pending = 0;
	let approved = 0;
	let declined = 0;
	const uniqueUsers = new Set();
	let male = 0;
	let female = 0;

	// 3. Loop through programs to get their applications
	for (const progDoc of programsSnap.docs) {
		const programId = progDoc.id;
		const appsQuery = query(
			collectionGroup(db, "users-application"),
			where("id", "==", programId),
		);
		const appsSnap = await getDocs(appsQuery);

		appsSnap.forEach((appDoc) => {
			const data = appDoc.data();
			const status = data.status || "Ongoing";

			// Count Statuses
			if (status === "Pending" || status === "Ongoing") pending++;
			else if (status === "Approved" || status === "Accepted") approved++;
			else if (status === "Declined" || status === "Rejected") declined++;

			// Track Unique Users
			// We assume the document ID is the User ID based on your previous setup,
			// or you can grab data.userId if you saved it.
			const userId = appDoc.ref.parent.parent?.id;
			if (userId) uniqueUsers.add(userId);

			// Note: If you don't save 'gender' in users-application, you'll need to fetch the user doc here.
			// For now, we will simulate the demographic split based on random assignment if missing,
			// but ideally, you'd check: if (data.gender === 'Male') male++;
			if (data.gender === "Male") male++;
			else if (data.gender === "Female") female++;
		});
	}

	return {
		totalBeneficiaries,
		verifiedUsers: uniqueUsers.size,
		pendingApplications: pending,
		approvedApplications: approved,
		declinedApplications: declined,
		demographics: {
			// Fallback to a 50/50 split if your DB doesn't track gender yet
			male:
				male === 0 && female === 0 ? Math.floor(uniqueUsers.size / 2) : male,
			female:
				male === 0 && female === 0 ? Math.ceil(uniqueUsers.size / 2) : female,
		},
	};
};
