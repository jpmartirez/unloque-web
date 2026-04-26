"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getProgram } from "@/app/services/programService";
import {
	fetchHeaderData,
	sendResponse,
	type HeaderData,
	type ResponseAttachmentFile,
	type ResponseSection,
	type ResponseSectionType,
	type UserApplicationDoc,
} from "@/app/services/organizationResponseService";
import { storage } from "@/utils/firebase";
import {
	getDownloadURL,
	ref,
	uploadBytesResumable,
	deleteObject,
} from "firebase/storage";


const getErrorMessage = (e: unknown) => {
	if (e instanceof Error) return e.message;
	if (typeof e === "string") return e;
	return "Unknown error";
};

const formatTimestamp = (timestamp: unknown) => {
	if (!timestamp) return "N/A";
	if (
		typeof timestamp === "object" &&
		timestamp !== null &&
		"seconds" in timestamp &&
		typeof (timestamp as { seconds?: unknown }).seconds === "number"
	) {
		return new Date(
			((timestamp as { seconds: number }).seconds ?? 0) * 1000,
		).toLocaleString();
	}
	return new Date(timestamp).toLocaleString();
};

const newId = () => {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return crypto.randomUUID();
	}
	return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const createSection = (type: ResponseSectionType): ResponseSection => {
	const id = newId();
	if (type === "paragraph") {
		return { id, type, label: "Paragraph", content: "" };
	}
	if (type === "list") {
		return { id, type, label: "List", items: [""] };
	}
	return { id, type, label: "Attachment", files: [] };
};

const ReviewAndResponsePage = () => {
	const router = useRouter();
	const params = useParams();
	const searchParams = useSearchParams();

	const programId = params?.programId as string;
	const applicationId = params?.applicationId as string;
	const userId = searchParams?.get("userId") || "";

	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [activeTab, setActiveTab] = useState<"review" | "response">("review");
	const [header, setHeader] = useState<HeaderData | null>(null);
	const [application, setApplication] = useState<UserApplicationDoc | null>(null);
	const [applicantPhotoFailed, setApplicantPhotoFailed] = useState(false);

	const [responseSections, setResponseSections] = useState<ResponseSection[]>([]);
	const [isSending, setIsSending] = useState(false);

	const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
	const [newSectionType, setNewSectionType] = useState<ResponseSectionType>(
		"paragraph",
	);

	type PendingAttachmentFile = ResponseAttachmentFile & { __file?: File };

	const getExistingResponseSections = (app: UserApplicationDoc): ResponseSection[] => {
		const orgResp = app.organizationResponse;
		if (typeof orgResp !== "object" || orgResp === null) return [];
		const responseSectionsUnknown = (orgResp as Record<string, unknown>)[
			"responseSections"
		];
		return Array.isArray(responseSectionsUnknown)
			? (responseSectionsUnknown as ResponseSection[])
			: [];
	};

	useEffect(() => {
		const run = async () => {
			if (!programId || !applicationId) return;
			if (!userId) {
				setError("Missing userId in URL.");
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			setError(null);

			try {
				const program = await getProgram(programId);
				if (!program?.organizationId) {
					throw new Error("Program missing organizationId.");
				}

				const data = await fetchHeaderData({
					organizationId: program.organizationId,
					programId,
					userId,
					applicationId,
				});

				if (!data) {
					setError("Application not found.");
					setIsLoading(false);
					return;
				}

				setHeader(data.header);
				setApplication(data.application);
				setResponseSections(getExistingResponseSections(data.application));
			} catch (e: unknown) {
				setError(getErrorMessage(e) || "Failed to load application.");
			} finally {
				setIsLoading(false);
			}
		};

		run();
	}, [programId, applicationId, userId]);

	useEffect(() => {
		setApplicantPhotoFailed(false);
	}, [header?.userPhotoUrl]);

	const applicationSubmittedAt = useMemo(() => {
		if (!application) return null;
		return application.createdAt || application.submittedAt || null;
	}, [application]);

	const setSection = (sectionId: string, updater: (s: ResponseSection) => ResponseSection) => {
		setResponseSections((prev) =>
			prev.map((s) => (s.id === sectionId ? updater(s) : s)),
		);
	};

	const removeSection = (sectionId: string) => {
		setResponseSections((prev) => prev.filter((s) => s.id !== sectionId));
	};

	const moveSection = (sectionId: string, direction: "up" | "down") => {
		setResponseSections((prev) => {
			const idx = prev.findIndex((s) => s.id === sectionId);
			if (idx < 0) return prev;
			const target = direction === "up" ? idx - 1 : idx + 1;
			if (target < 0 || target >= prev.length) return prev;
			const copy = [...prev];
			const [item] = copy.splice(idx, 1);
			copy.splice(target, 0, item);
			return copy;
		});
	};

	const addSection = () => {
		setResponseSections((prev) => [...prev, createSection(newSectionType)]);
		setIsAddSectionOpen(false);
	};

	const addAttachmentFiles = (sectionId: string, files: FileList | null) => {
		if (!files || files.length === 0) return;
		setSection(sectionId, (s) => {
			if (s.type !== "attachment") return s;
			const added: PendingAttachmentFile[] = Array.from(files).map((f) => ({
				name: f.name,
				__file: f,
			}));
			return { ...s, files: [...s.files, ...added] };
		});
	};

	const uploadPendingFiles = async () => {
		if (!header) return;

		for (const section of responseSections) {
			if (section.type !== "attachment") continue;

			for (let i = 0; i < section.files.length; i++) {
				const file = section.files[i] as PendingAttachmentFile;
				if (file.downloadUrl) continue;
				if (!file.__file) continue;

				const storagePath = `organization_responses/${header.organizationId}/${applicationId}/${section.id}/${Date.now()}_${file.__file.name}`;
				const storageRef = ref(storage, storagePath);

				await new Promise<void>((resolve, reject) => {
					const task = uploadBytesResumable(storageRef, file.__file);
					task.on(
						"state_changed",
						() => {},
						(err) => reject(err),
						async () => {
							const url = await getDownloadURL(task.snapshot.ref);
							setSection(section.id, (s) => {
								if (s.type !== "attachment") return s;
								const nextFiles = [...s.files];
								nextFiles[i] = {
									name: nextFiles[i].name,
									downloadUrl: url,
									uploadedAt: new Date().toISOString(),
								};
								return { ...s, files: nextFiles };
							});
							resolve();
						},
					);
				});
			}
		}
	};

	const sanitizeResponseSections = (sections: ResponseSection[]): ResponseSection[] => {
		return sections.map((s) => {
			if (s.type !== "attachment") return s;
			return {
				...s,
				files: s.files
					.filter((f) => Boolean(f.downloadUrl))
					.map((f) => ({
						name: f.name,
						downloadUrl: f.downloadUrl,
						uploadedAt: f.uploadedAt,
					})),
			};
		});
	};

	const removeAttachment = async (
		sectionId: string,
		fileIndex: number,
		file: ResponseAttachmentFile,
	) => {
		setSection(sectionId, (s) => {
			if (s.type !== "attachment") return s;
			const next = [...s.files];
			next.splice(fileIndex, 1);
			return { ...s, files: next };
		});

		if (!file.downloadUrl) return;

		try {
			await deleteObject(ref(storage, file.downloadUrl));
		} catch {
			// best-effort
		}
	};

	const onSend = async () => {
		if (!header) return;
		setIsSending(true);
		setError(null);

		try {
			await uploadPendingFiles();
			const sanitized = sanitizeResponseSections(responseSections);

			await sendResponse({
				organizationId: header.organizationId,
				organizationName: header.orgName,
				programId: header.programId,
				programName: header.programName,
				userId: header.userId,
				applicationId,
				responseSections: sanitized,
			});

			router.back();
		} catch (e: unknown) {
			setError(getErrorMessage(e) || "Failed to send response.");
		} finally {
			setIsSending(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center bg-[#f5f6f8] text-gray-500 font-medium">
				Loading...
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center p-8">
				<div className="max-w-lg w-full bg-white border border-gray-200 rounded-2xl p-6">
					<div className="text-lg font-bold text-gray-900 mb-2">Error</div>
					<div className="text-sm text-gray-600 mb-6">{error}</div>
					<div className="flex gap-3">
						<button
							onClick={() => router.back()}
							className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-semibold text-sm"
						>
							Back
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col min-h-screen p-8 font-sans items-center">
			<div className="w-full max-w-6xl">
				<div className="flex items-center justify-between mb-6">
					<button
						onClick={() => router.back()}
						className="flex items-center gap-2 text-gray-500 hover:text-black font-semibold text-sm transition-colors"
					>
						<svg
							className="w-4 h-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2.5"
								d="M10 19l-7-7m0 0l7-7m-7 7h18"
							/>
						</svg>
						Back
					</button>

					<button
						onClick={onSend}
						disabled={isSending}
						className="px-5 py-2.5 rounded-full bg-[#00abc0] text-white text-sm font-semibold disabled:opacity-60"
					>
						{isSending ? "Sending..." : "Send Response"}
					</button>
				</div>

				<div className="flex items-start justify-between gap-6 mb-6">
					<div className="flex items-center gap-4">
						{header?.logoUrl ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={header.logoUrl}
								alt={header.orgName}
								className="w-14 h-14 rounded-xl object-cover border border-gray-200"
							/>
						) : (
							<div className="w-14 h-14 rounded-xl bg-gray-100 border border-gray-200" />
						)}
						<div>
							<div className="text-2xl font-bold text-gray-900">
								{header?.programName || "Program"}
							</div>
							<div className="text-sm font-medium text-gray-600">
								{header?.orgName || "Organization"}
							</div>
						</div>
					</div>

					<div className="text-right">
						<div className="text-xs text-gray-500 font-semibold">Submitted</div>
						<div className="text-sm text-gray-800 font-medium">
							{formatTimestamp(applicationSubmittedAt)}
						</div>
						{header?.userPhotoUrl && !applicantPhotoFailed ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={header.userPhotoUrl}
								alt="Applicant"
								onError={() => setApplicantPhotoFailed(true)}
								className="w-12 h-12 rounded-full object-cover border border-gray-200 ml-auto mt-3"
							/>
						) : (
							<div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 ml-auto mt-3 flex items-center justify-center">
								<svg
									className="w-6 h-6 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
									/>
								</svg>
							</div>
						)}
						<div className="text-xs text-gray-500 font-semibold mt-2">Applicant</div>
						<div className="text-sm text-gray-800 font-medium">
							{header?.userEmail || userId}
						</div>
					</div>
				</div>

				<div className="flex gap-2 mb-6">
					<button
						onClick={() => setActiveTab("review")}
						className={`px-5 py-2.5 rounded-full text-sm font-semibold border ${activeTab === "review" ? "bg-[#00abc0] text-white border-[#00abc0]" : "bg-white text-gray-700 border-gray-200"}`}
					>
						Review
					</button>
					<button
						onClick={() => setActiveTab("response")}
						className={`px-5 py-2.5 rounded-full text-sm font-semibold border ${activeTab === "response" ? "bg-[#00abc0] text-white border-[#00abc0]" : "bg-white text-gray-700 border-gray-200"}`}
					>
						Response
					</button>
				</div>

				{activeTab === "review" ? (
					<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
						<div className="text-lg font-bold text-gray-900 mb-4">
							Application Answers
						</div>
						{Array.isArray(application?.formFields) &&
						application.formFields.length > 0 ? (
							<div className="space-y-4">
								{application.formFields.map((f: unknown, idx: number) => (
									<div
										key={idx}
											className="border border-gray-200 rounded-xl p-4"
									>
											<div className="text-sm font-bold text-gray-900">
											{(() => {
												const rec =
													typeof f === "object" && f !== null
														? (f as Record<string, unknown>)
													: null;
												const label = rec?.["label"] ?? rec?.["question"];
												return typeof label === "string" && label.trim()
													? label
													: `Field ${idx + 1}`;
											})()}
											</div>
											<div className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
											{(() => {
												const rec =
													typeof f === "object" && f !== null
														? (f as Record<string, unknown>)
													: null;
												const value =
													rec?.["response"] ?? rec?.["value"] ?? rec?.["answer"];
												return value === null || value === undefined || value === ""
													? "—"
													: String(value);
											})()}
											</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-sm text-gray-500">
								No answers found on this application.
							</div>
						)}
					</div>
				) : (
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<div className="text-lg font-bold text-gray-900">
									Response Builder
								</div>
								<div className="text-sm text-gray-600">
									Add sections to respond to the applicant.
								</div>
							</div>

							<button
								onClick={() => setIsAddSectionOpen(true)}
								className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-800 text-sm font-semibold"
							>
								Add Response Section
							</button>
						</div>

						{responseSections.length === 0 ? (
							<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-sm text-gray-500">
								No response sections yet.
							</div>
						) : null}

						{responseSections.map((section, index) => (
							<div
								key={section.id}
								className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
							>
								<div className="flex items-start justify-between gap-4 mb-4">
									<div>
										<div className="text-sm font-bold text-gray-900">
											Section {index + 1}
										</div>
										<div className="text-xs text-gray-500 font-semibold uppercase">
											{section.type}
										</div>
									</div>

									<div className="flex items-center gap-2">
										<button
											onClick={() => moveSection(section.id, "up")}
											disabled={index === 0}
											className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-800 text-xs font-bold disabled:opacity-40"
										>
											Up
										</button>
										<button
											onClick={() => moveSection(section.id, "down")}
											disabled={index === responseSections.length - 1}
											className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-800 text-xs font-bold disabled:opacity-40"
										>
											Down
										</button>
										<button
											onClick={() => removeSection(section.id)}
											className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-bold"
										>
											Delete
										</button>
									</div>
								</div>

								<label className="block text-xs font-bold text-gray-700 mb-2">
									Title
								</label>
								<input
									value={section.label}
									onChange={(e) =>
										setSection(section.id, (s) => ({ ...s, label: e.target.value }))
									}
									className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#00abc0]"
								/>

								{section.type === "paragraph" ? (
									<div className="mt-4">
										<label className="block text-xs font-bold text-gray-700 mb-2">
											Content
										</label>
										<textarea
											value={section.content}
											onChange={(e) =>
												setSection(section.id, (s) =>
													s.type === "paragraph"
														? { ...s, content: e.target.value }
														: s,
												)
											}
											rows={4}
											className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#00abc0]"
										/>
									</div>
								) : null}

								{section.type === "list" ? (
									<div className="mt-4">
										<label className="block text-xs font-bold text-gray-700 mb-2">
											Items
										</label>
										<div className="space-y-2">
											{section.items.map((item, idx) => (
												<div key={`${section.id}-${idx}`} className="flex gap-2">
													<input
														value={item}
														onChange={(e) =>
															setSection(section.id, (s) => {
																if (s.type !== "list") return s;
																const next = [...s.items];
																next[idx] = e.target.value;
																return { ...s, items: next };
															})
														}
														className="flex-1 bg-white border border-gray-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00abc0]"
													/>
													<button
														onClick={() =>
															setSection(section.id, (s) => {
																if (s.type !== "list") return s;
																const next = [...s.items];
																next.splice(idx, 1);
																return { ...s, items: next.length ? next : [""] };
															})
														}
														className="px-3 py-2 rounded-xl bg-red-50 text-red-700 text-xs font-bold"
													>
														Remove
													</button>
												</div>
											))}
										</div>
										<button
											onClick={() =>
											setSection(section.id, (s) =>
												s.type === "list" ? { ...s, items: [...s.items, ""] } : s,
											)
										}
										className="mt-3 px-4 py-2 rounded-lg bg-gray-100 text-gray-800 text-xs font-bold"
									>
										+ Add Item
									</button>
									</div>
								) : null}

								{section.type === "attachment" ? (
									<div className="mt-4">
										<label className="block text-xs font-bold text-gray-700 mb-2">
											Files
										</label>
										<div className="space-y-2">
											{section.files.length === 0 ? (
												<div className="text-sm text-gray-500">No files yet.</div>
											) : (
												section.files.map((f, idx) => (
													<div
														key={`${section.id}-file-${idx}`}
														className="flex items-center justify-between gap-3 border border-gray-200 rounded-xl px-4 py-2"
													>
														<div className="text-sm text-gray-800 truncate">
															{f.name}
															{(f as PendingAttachmentFile).__file && !f.downloadUrl ? (
																<span className="text-xs text-gray-500 ml-2">
																	(pending upload)
																</span>
															) : null}
														</div>
														<button
															onClick={() => removeAttachment(section.id, idx, f)}
															className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-bold"
														>
															Remove
														</button>
													</div>
												))
											)}
										</div>

										<label className="mt-3 inline-block px-4 py-2 rounded-lg bg-gray-100 text-gray-800 text-xs font-bold cursor-pointer">
											+ Add Files
											<input
												type="file"
												multiple
												onChange={(e) => {
													addAttachmentFiles(section.id, e.target.files);
													e.target.value = "";
												}}
												className="hidden"
											/>
										</label>
									</div>
								) : null}
							</div>
						))}
					</div>
				)}
			</div>

			{isAddSectionOpen ? (
				<div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
					<div className="w-full max-w-md bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
						<div className="text-lg font-bold text-gray-900 mb-4">
							Add Response Section
						</div>
						<label className="block text-xs font-bold text-gray-700 mb-2">
							Section Type
						</label>
						<select
							value={newSectionType}
							onChange={(e) =>
								setNewSectionType(e.target.value as ResponseSectionType)
							}
							className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#00abc0]"
						>
							<option value="paragraph">Paragraph</option>
							<option value="list">List</option>
							<option value="attachment">Attachment</option>
						</select>
						<div className="flex gap-3 justify-end mt-6">
							<button
								onClick={() => setIsAddSectionOpen(false)}
								className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 text-sm font-semibold"
							>
								Cancel
							</button>
							<button
								onClick={addSection}
								className="px-4 py-2 rounded-lg bg-[#00abc0] text-white text-sm font-semibold"
							>
								Add
							</button>
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
};

export default ReviewAndResponsePage;
