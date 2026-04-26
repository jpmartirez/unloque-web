import { db } from "@/utils/firebase";
import {
	addDoc,
	collection,
	doc,
	getDoc,
	serverTimestamp,
	updateDoc,
} from "firebase/firestore";

export type ResponseSectionType = "paragraph" | "list" | "attachment";

export interface ResponseAttachmentFile {
	name: string;
	downloadUrl?: string;
	uploadedAt?: string;
}

export type ResponseSection =
	| {
			id: string;
			type: "paragraph";
			label: string;
			content: string;
	  }
	| {
			id: string;
			type: "list";
			label: string;
			items: string[];
	  }
	| {
			id: string;
			type: "attachment";
			label: string;
			files: ResponseAttachmentFile[];
	  };

export interface HeaderData {
	programName: string;
	orgName: string;
	logoUrl: string;
	deadline: string;
	category: string;
	userEmail: string;
	userPhotoUrl: string;
	userId: string;
	programId: string;
	organizationId: string;
}

export interface UserApplicationDoc {
	id?: string;
	programId?: string;
	status?: string;
	createdAt?: unknown;
	submittedAt?: unknown;
	formFields?: unknown[];
	organizationResponse?: unknown;
	organizationId?: string;
	programName?: string;
	organizationName?: string;
	logoUrl?: string;
	deadline?: string;
	category?: string;
}

export const fetchHeaderData = async (params: {
	organizationId: string;
	programId: string;
	userId: string;
	applicationId: string;
}): Promise<{ header: HeaderData; application: UserApplicationDoc } | null> => {
	const { organizationId, programId, userId, applicationId } = params;

	const [orgSnap, programSnap, userSnap, appSnap] = await Promise.all([
		getDoc(doc(db, "organizations", organizationId)),
		getDoc(doc(db, "organizations", organizationId, "programs", programId)),
		getDoc(doc(db, "users", userId)),
		getDoc(doc(db, "users", userId, "users-application", applicationId)),
	]);

	if (!appSnap.exists()) return null;

	const orgData = orgSnap.exists()
		? (orgSnap.data() as Record<string, unknown>)
		: {};
	const programData = programSnap.exists()
		? (programSnap.data() as Record<string, unknown>)
		: {};
	const userData = userSnap.exists()
		? (userSnap.data() as Record<string, unknown>)
		: {};
	const application = (appSnap.data() as Record<string, unknown>) as UserApplicationDoc;

	const header: HeaderData = {
		programName: String(
			(programData["name"] as unknown) || application.programName || "",
		),
		orgName: String((orgData["name"] as unknown) || application.organizationName || ""),
		logoUrl: String(
			(orgData["logoUrl"] as unknown) || application.logoUrl || "",
		),
		deadline: String(
			(programData["deadline"] as unknown) || application.deadline || "",
		),
		category: String(
			(programData["category"] as unknown) || application.category || "",
		),
		userEmail: String((userData["email"] as unknown) || ""),
		userPhotoUrl: String(
			(userData["photoUrl"] as unknown) ||
				(userData["photoURL"] as unknown) ||
				"",
		),
		userId,
		programId,
		organizationId,
	};

	return { header, application };
};

export const sendResponse = async (params: {
	organizationId: string;
	organizationName: string;
	programId: string;
	programName: string;
	userId: string;
	applicationId: string;
	responseSections: ResponseSection[];
}): Promise<void> => {
	const {
		organizationId,
		organizationName,
		programId,
		programName,
		userId,
		applicationId,
		responseSections,
	} = params;

	const userAppRef = doc(db, "users", userId, "users-application", applicationId);

	await updateDoc(userAppRef, {
		status: "Completed",
		organizationResponse: {
			organizationId,
			userId,
			applicationId,
			responseSections,
			createdAt: serverTimestamp(),
		},
	});

	await addDoc(collection(db, "users", userId, "notifications"), {
		title: "Response Received",
		message: `Your application for ${programName} has received a response.`,
		type: "response",
		programId,
		programName,
		organizationId,
		organizationName,
		applicationId,
		isRead: false,
		timestamp: serverTimestamp(),
	});
};
