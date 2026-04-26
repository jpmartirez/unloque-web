"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
	getOrganization,
	getProgram,
	updateProgram,
} from "@/app/services/programService";
import type {
	Program,
	ProgramAttachmentFile,
	ProgramDetailSection,
	ProgramDetailSectionType,
	ProgramFormField,
	ProgramFormFieldType,
} from "@/app/types/program";
import Image from "next/image";
import { storage } from "@/utils/firebase";
import {
	deleteObject,
	getDownloadURL,
	ref,
	uploadBytesResumable,
} from "firebase/storage";

type TabKey = "basic" | "details" | "form";

const formatTypeLabel = (type: string) =>
	type
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");

const safeArray = <T,>(value: unknown, fallback: T[] = []): T[] =>
	Array.isArray(value) ? (value as T[]) : fallback;

const hexFromArgbInt = (value: number): string => {
	const rgb = value & 0x00ffffff;
	return `#${rgb.toString(16).padStart(6, "0")}`;
};

const toColorInput = (value: unknown): string => {
	if (typeof value === "string") {
		if (value.startsWith("#") && (value.length === 7 || value.length === 4)) {
			return value.length === 4
				? `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`
				: value;
		}
		if (value.startsWith("0x")) {
			const parsed = Number.parseInt(value);
			if (Number.isFinite(parsed)) return hexFromArgbInt(parsed);
		}
	}
	if (typeof value === "number" && Number.isFinite(value)) {
		return hexFromArgbInt(value);
	}
	return "#00abc0";
};

const toArgbIntFromHex = (hex: string): number => {
	const clean = hex.replace("#", "");
	const rgb = Number.parseInt(clean, 16);
	return (0xff000000 | rgb) >>> 0;
};

const getSectionBadgeColor = (type: ProgramDetailSectionType) => {
	switch (type) {
		case "paragraph":
			return "bg-blue-600";
		case "attachment":
			return "bg-red-700";
		case "list":
			return "bg-orange-500";
		default:
			return "bg-gray-600";
	}
};

const getFieldBadgeColor = (type: ProgramFormFieldType) => {
	switch (type) {
		case "short_answer":
			return "bg-[#007b8a]";
		case "paragraph":
			return "bg-blue-600";
		case "multiple_choice":
			return "bg-[#e68a00]";
		case "checkbox":
			return "bg-green-700";
		case "date":
			return "bg-[#6b21a8]";
		case "attachment":
			return "bg-red-700";
		default:
			return "bg-gray-500";
	}
};

const supportsOptions = (type: ProgramFormFieldType) =>
	type === "multiple_choice" || type === "checkbox";

const BasicEditorTab = ({
	program,
	organization,
	onChange,
	onToggleStatus,
}: {
	program: Program;
	organization: { name?: string; logoUrl?: string } | null;
	onChange: (patch: Partial<Program>) => void;
	onToggleStatus: () => void;
}) => {
	const status = String(program.programStatus || "Draft");
	const isOpen = status === "Open";

	return (
		<div className="mt-8">
			<div className="flex items-baseline gap-3 mb-4">
				<h2 className="text-2xl font-bold text-gray-900">Basic Editor</h2>
				<span className="text-[11px] text-gray-400 font-medium">
					Edit core program information.
				</span>
			</div>

			{/* Header card (mirrors the Flutter basic tab) */}
			<div
				className="rounded-2xl border border-gray-200 overflow-hidden"
				style={{
					backgroundColor: toColorInput(program.color),
				}}
			>
				<div className="p-5 flex items-center gap-4">
					<div className="w-10 h-10 rounded-lg bg-white/70 overflow-hidden flex items-center justify-center">
						{organization?.logoUrl ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={organization.logoUrl}
								alt="Organization logo"
								className="w-full h-full object-cover"
							/>
						) : (
							<span className="text-gray-700 font-bold">{(organization?.name || "O").slice(0, 1)}</span>
						)}
					</div>
					<div className="flex-1">
						<div className="text-lg font-bold text-gray-900">
							{program.name?.trim() ? program.name : "Untitled Program"}
						</div>
						<div className="text-xs font-semibold text-gray-700">
							{organization?.name || "Organization"}
						</div>
					</div>
				</div>

				<div className="bg-white p-4 flex items-center justify-between gap-3">
					<div className="text-sm font-semibold text-gray-800">
						Due: {program.deadline || "—"}
						<span className="mx-3 text-gray-300">|</span>
						<span
							className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
						>
							{status}
						</span>
					</div>
					<div className="text-sm font-bold text-gray-800">
						{program.category || "No category"}
					</div>
				</div>
			</div>

			<div className="mt-6 bg-white rounded-3xl shadow-sm p-8 md:p-10 border border-gray-200 flex flex-col gap-6">
				<div className="flex flex-col gap-2">
					<label className="text-lg font-bold text-gray-900">Program Name</label>
					<input
						type="text"
						value={program.name || ""}
						onChange={(e) => onChange({ name: e.target.value })}
						className="w-full border border-gray-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00abc0] text-sm text-gray-800"
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label className="text-lg font-bold text-gray-900">Category</label>
					<div className="relative w-full md:max-w-md">
						<select
							className="w-full border border-gray-400 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-[#00abc0] bg-transparent text-gray-800 text-sm cursor-pointer"
							value={program.category || "Education"}
							onChange={(e) => onChange({ category: e.target.value })}
						>
							<option value="Education">Education</option>
							<option value="Health">Health</option>
							<option value="Healthcare">Healthcare</option>
							<option value="Research">Research</option>
						</select>
						<div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
							<svg
								className="w-4 h-4 text-gray-800"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2.5"
									d="M19 9l-7 7-7-7"
								/>
							</svg>
						</div>
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<label className="text-lg font-bold text-gray-900">Deadline</label>
					<div className="relative w-full md:max-w-md">
						<input
							type="date"
							value={program.deadline || ""}
							onChange={(e) => onChange({ deadline: e.target.value })}
							className="w-full border border-gray-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00abc0] text-sm text-gray-800 appearance-none"
						/>
					</div>
				</div>

				<div className="flex flex-col gap-2">
					<div className="flex items-baseline gap-2">
						<label className="text-lg font-bold text-gray-900">
							Program Color
						</label>
						<span className="text-[10px] text-gray-400 font-medium">
							This will be the color that shows on the program card.
						</span>
					</div>
					<div className="flex items-center gap-4">
						<input
							type="color"
							value={toColorInput(program.color)}
							onChange={(e) => onChange({ color: e.target.value })}
							className="w-12 h-12 rounded cursor-pointer border-none p-0"
							title="Choose a color"
						/>
						<button
							type="button"
							className="md:max-w-md bg-[#00abc0] hover:bg-[#0096a8] text-white font-semibold py-3 px-6 rounded-xl transition-colors text-sm flex-1 text-center"
						>
							Tap to change color
						</button>
					</div>
				</div>
			</div>

			<div className="mt-6">
				<button
					type="button"
					onClick={onToggleStatus}
					className={`w-full text-white text-sm font-bold py-4 rounded-xl transition-colors ${isOpen ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
				>
					{isOpen ? "Close Program" : "Open Program"}
				</button>
			</div>
		</div>
	);
};

const DetailsEditorTab = ({
	organizationId,
	programId,
	sections,
	onChange,
}: {
	organizationId: string;
	programId: string;
	sections: ProgramDetailSection[];
	onChange: (next: ProgramDetailSection[]) => void;
}) => {
	const [newType, setNewType] = useState<ProgramDetailSectionType>("paragraph");
	const [uploadStatus, setUploadStatus] = useState<string>("");
	const nextIdRef = useRef<number>(1);

	useEffect(() => {
		let highest = 0;
		for (const section of sections) {
			const parsed = Number.parseInt(section.id, 10);
			if (Number.isFinite(parsed) && parsed > highest) highest = parsed;
		}
		nextIdRef.current = highest + 1;
	}, [sections]);

	const addSection = () => {
		const id = String(nextIdRef.current++);
		const label = "New Section";
		const section: ProgramDetailSection =
			newType === "paragraph"
				? { id, type: "paragraph", label, content: "" }
				: newType === "list"
					? { id, type: "list", label, items: ["Enter an item"] }
					: { id, type: "attachment", label, files: [] };
		onChange([...sections, section]);
	};

	const move = (index: number, direction: -1 | 1) => {
		const next = [...sections];
		const swapWith = index + direction;
		if (swapWith < 0 || swapWith >= next.length) return;
		const temp = next[index];
		next[index] = next[swapWith];
		next[swapWith] = temp;
		onChange(next);
	};

	const updateSection = (index: number, patch: Partial<ProgramDetailSection>) => {
		const next = [...sections];
		next[index] = { ...next[index], ...patch } as ProgramDetailSection;
		onChange(next);
	};

	const deleteSection = async (index: number) => {
		const section = sections[index];
		if (!section) return;

		if (section.type === "attachment") {
			const firebaseFiles = safeArray<ProgramAttachmentFile>(section.files).filter(
				(f) => typeof f.downloadUrl === "string" && f.downloadUrl.length > 0,
			);
			if (firebaseFiles.length > 0) {
				const ok = window.confirm(
					"This section has uploaded files. Delete the section and its files from storage?",
				);
				if (!ok) return;

				setUploadStatus("Deleting files from storage...");
				for (const file of firebaseFiles) {
					try {
						await deleteObject(ref(storage, file.downloadUrl!));
					} catch (e) {
						console.error("Failed to delete file:", e);
					}
				}
				setUploadStatus("");
			}
		}

		const next = [...sections];
		next.splice(index, 1);
		onChange(next);
	};

	const uploadFiles = async (sectionIndex: number, files: FileList | null) => {
		const section = sections[sectionIndex];
		if (!section || section.type !== "attachment") return;
		if (!files || files.length === 0) return;

		setUploadStatus("Uploading files...");
		const newFiles: ProgramAttachmentFile[] = [];

		for (const file of Array.from(files)) {
			const uniqueName = `${Date.now()}_${file.name}`;
			const storagePath = `organizations/${organizationId}/programs/${programId}/details/${section.id}/${uniqueName}`;
			const storageRef = ref(storage, storagePath);

			const task = uploadBytesResumable(storageRef, file);
			await new Promise<void>((resolve, reject) => {
				task.on(
					"state_changed",
					(snapshot) => {
						const pct = Math.round(
							(snapshot.bytesTransferred / snapshot.totalBytes) * 100,
						);
						setUploadStatus(`Uploading ${file.name} (${pct}%)...`);
					},
					(error) => reject(error),
					() => resolve(),
				);
			});

			const url = await getDownloadURL(task.snapshot.ref);
			newFiles.push({
				name: file.name,
				downloadUrl: url,
				uploadedAt: new Date().toISOString(),
			});
		}

		const next = [...sections];
		const updated = safeArray<ProgramAttachmentFile>(section.files);
		next[sectionIndex] = {
			...section,
			files: [...updated, ...newFiles],
		} as ProgramDetailSection;
		onChange(next);
		setUploadStatus("");
	};

	const removeAttachment = async (
		sectionIndex: number,
		fileIndex: number,
	) => {
		const section = sections[sectionIndex];
		if (!section || section.type !== "attachment") return;
		const files = safeArray<ProgramAttachmentFile>(section.files);
		const target = files[fileIndex];
		if (!target) return;

		const ok = window.confirm("Remove this file from the section?");
		if (!ok) return;

		if (target.downloadUrl) {
			try {
				await deleteObject(ref(storage, target.downloadUrl));
			} catch (e) {
				console.error("Failed to delete file from storage:", e);
			}
		}

		const nextFiles = [...files];
		nextFiles.splice(fileIndex, 1);
		const next = [...sections];
		next[sectionIndex] = { ...section, files: nextFiles } as ProgramDetailSection;
		onChange(next);
	};

	return (
		<div className="mt-8">
			<div className="flex items-baseline gap-3 mb-4">
				<h2 className="text-2xl font-bold text-gray-900">Details Editor</h2>
				<span className="text-[11px] text-gray-400 font-medium">
					Build program details sections.
				</span>
			</div>

			{uploadStatus && (
				<div className="mb-4 bg-white border border-gray-200 rounded-xl p-4 text-sm font-semibold text-gray-700">
					{uploadStatus}
				</div>
			)}

			<div className="flex flex-col gap-6 relative pb-20">
				{sections.length === 0 && (
					<div className="bg-white rounded-3xl p-8 border border-gray-100 text-center text-gray-500">
						No detail sections yet.
					</div>
				)}

				{sections.map((section, index) => (
					<div
						key={section.id || index}
						className="bg-white rounded-3xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] p-8 border border-gray-100"
					>
						<div className="flex justify-between items-start mb-4">
							<div className="flex items-center gap-3">
								<span
									className={`${getSectionBadgeColor(section.type)} text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider`}
								>
									{section.type}
								</span>
							</div>

							<div className="flex items-center gap-2">
								<button
									type="button"
									title="Move Up"
									onClick={() => move(index, -1)}
									className="p-1.5 text-gray-400 hover:text-black transition-colors rounded-lg hover:bg-gray-100"
									disabled={index === 0}
								>
									<svg
										className="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M5 15l7-7 7 7"
										/>
									</svg>
								</button>
								<button
									type="button"
									title="Move Down"
									onClick={() => move(index, 1)}
									className="p-1.5 text-gray-400 hover:text-black transition-colors rounded-lg hover:bg-gray-100"
									disabled={index === sections.length - 1}
								>
									<svg
										className="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</button>
								<div className="w-px h-6 bg-gray-200 mx-1"></div>
								<button
									type="button"
									title="Delete Section"
									onClick={() => void deleteSection(index)}
									className="bg-red-50 text-red-600 p-2 rounded-full hover:bg-red-600 hover:text-white transition-colors"
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
											strokeWidth="2"
											d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
										/>
									</svg>
								</button>
							</div>
						</div>

						<input
							type="text"
							value={section.label || ""}
							onChange={(e) => updateSection(index, { label: e.target.value })}
							placeholder="Section title"
							className="w-full text-lg font-bold text-gray-900 mb-4 border-b border-transparent hover:border-gray-300 focus:border-[#00abc0] focus:outline-none bg-transparent transition-colors"
						/>

						{section.type === "paragraph" && (
							<textarea
								className="w-full border border-gray-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00abc0] text-sm text-gray-800 min-h-[140px] resize-y"
								value={section.content}
								onChange={(e) =>
									updateSection(index, { content: e.target.value })
								}
								placeholder="Enter paragraph content..."
							/>
						)}

						{section.type === "list" && (
							<div className="flex flex-col gap-3">
								{section.items.map((item, itemIndex) => (
									<div key={itemIndex} className="flex items-center gap-2">
										<input
											type="text"
											value={item}
											onChange={(e) => {
												const items = [...section.items];
												items[itemIndex] = e.target.value;
												updateSection(index, { items } as any);
											}}
											className="flex-1 border border-gray-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00abc0]"
											placeholder="List item"
										/>
										<button
											type="button"
											onClick={() => {
												const items = [...section.items];
												items.splice(itemIndex, 1);
												updateSection(index, { items } as any);
											}}
											className="px-3 py-2 rounded-lg bg-red-50 text-red-700 font-bold hover:bg-red-100"
											disabled={section.items.length <= 1}
											title="Remove item"
										>
											−
										</button>
									</div>
								))}
								<button
									type="button"
									onClick={() => {
										updateSection(index, {
											items: [...section.items, "Enter an item"],
										} as any);
									}}
									className="w-fit text-sm font-bold text-[#00abc0] hover:text-black"
								>
									+ Add item
								</button>
							</div>
						)}

						{section.type === "attachment" && (
							<div className="flex flex-col gap-3">
								<div className="flex items-center justify-between bg-gray-50 border border-dashed border-gray-300 rounded-xl p-5">
									<div>
										<p className="text-sm font-bold text-gray-900">
											Attachments
										</p>
										<p className="text-xs text-gray-500 font-medium mt-0.5">
											Upload files applicants can view/download.
										</p>
									</div>
									<label className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 shadow-sm transition-colors cursor-pointer">
										<input
											type="file"
											multiple
											onChange={(e) =>
												void uploadFiles(index, e.target.files)
											}
											className="hidden"
										/>
										Manage Files
									</label>
								</div>

								{safeArray<ProgramAttachmentFile>(section.files).length > 0 && (
									<div className="flex flex-col gap-2">
										{safeArray<ProgramAttachmentFile>(section.files).map(
											(file, fileIndex) => (
												<div
													key={`${file.downloadUrl || file.name}_${fileIndex}`}
													className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3"
												>
													<a
														href={file.downloadUrl || "#"}
														target="_blank"
														rel="noreferrer"
														className="text-sm font-bold text-gray-900 hover:underline"
													>
														{file.name}
													</a>
													<button
														type="button"
														onClick={() =>
														void removeAttachment(index, fileIndex)
													}
														className="text-xs font-bold text-red-700 hover:text-red-900"
													>
														Remove
													</button>
												</div>
										),
										)}
									</div>
								)}
							</div>
						)}
					</div>
				))}

				<div className="sticky bottom-0 mt-4 pb-4 flex justify-end">
					<div className="bg-white/90 backdrop-blur border border-gray-200 rounded-full px-4 py-3 flex items-center gap-3 shadow-sm">
						<select
							value={newType}
							onChange={(e) =>
								setNewType(e.target.value as ProgramDetailSectionType)
							}
							className="border border-gray-300 rounded-full px-4 py-2 text-sm font-bold text-gray-800 bg-transparent"
						>
							<option value="paragraph">Paragraph</option>
							<option value="list">List</option>
							<option value="attachment">Attachment</option>
						</select>
						<button
							type="button"
							onClick={addSection}
							className="bg-[#00abc0] hover:bg-[#0096a8] text-white text-sm font-bold py-2.5 px-6 rounded-full flex items-center gap-2 transition-transform transform hover:scale-105"
						>
							+ Add New Section
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

const FormEditorTab = ({
	fields,
	onChange,
}: {
	fields: ProgramFormField[];
	onChange: (next: ProgramFormField[]) => void;
}) => {
	const [newType, setNewType] = useState<ProgramFormFieldType>("short_answer");
	const nextIdRef = useRef<number>(1);

	useEffect(() => {
		let highest = 0;
		for (const field of fields) {
			const parsed = Number.parseInt(field.id, 10);
			if (Number.isFinite(parsed) && parsed > highest) highest = parsed;
		}
		nextIdRef.current = highest + 1;
	}, [fields]);

	const addField = () => {
		const id = String(nextIdRef.current++);
		const base: ProgramFormField = {
			id,
			type: newType,
			label: "New Field",
			required: true,
		};
		const withOptions: ProgramFormField = supportsOptions(newType)
			? { ...base, options: ["Option 1", "Option 2", "Option 3"] }
			: { ...base, options: [] };

		onChange([...fields, withOptions]);
	};

	const move = (index: number, direction: -1 | 1) => {
		const next = [...fields];
		const swapWith = index + direction;
		if (swapWith < 0 || swapWith >= next.length) return;
		const temp = next[index];
		next[index] = next[swapWith];
		next[swapWith] = temp;
		onChange(next);
	};

	const updateField = (index: number, patch: Partial<ProgramFormField>) => {
		const next = [...fields];
		next[index] = { ...next[index], ...patch };
		onChange(next);
	};

	const deleteField = (index: number) => {
		const ok = window.confirm("Delete this form field?");
		if (!ok) return;
		const next = [...fields];
		next.splice(index, 1);
		onChange(next);
	};

	return (
		<div className="mt-8">
			<div className="flex items-baseline gap-3 mb-4">
				<h2 className="text-2xl font-bold text-gray-900">Form Editor</h2>
				<span className="text-[11px] text-gray-400 font-medium">
					Build the application form template.
				</span>
			</div>

			<div className="flex flex-col gap-6 relative pb-20">
				{fields.length === 0 && (
					<div className="bg-white rounded-3xl p-8 border border-gray-100 text-center text-gray-500">
						No form fields yet.
					</div>
				)}

				{fields.map((field, index) => (
					<div
						key={field.id || index}
						className="bg-white rounded-3xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] p-8 border border-gray-100"
					>
						<div className="flex justify-between items-start mb-4">
							<div className="flex items-center gap-3 flex-wrap">
								<span
									className={`${getFieldBadgeColor(field.type)} text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider`}
								>
									{formatTypeLabel(field.type)}
								</span>
								{field.required && (
									<span className="bg-[#f03a3a] text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
										Required
									</span>
								)}
							</div>
							<div className="flex items-center gap-2">
								<button
									type="button"
									title="Move Up"
									onClick={() => move(index, -1)}
									className="p-1.5 text-gray-400 hover:text-black transition-colors rounded-lg hover:bg-gray-100"
									disabled={index === 0}
								>
									<svg
										className="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M5 15l7-7 7 7"
										/>
									</svg>
								</button>
								<button
									type="button"
									title="Move Down"
									onClick={() => move(index, 1)}
									className="p-1.5 text-gray-400 hover:text-black transition-colors rounded-lg hover:bg-gray-100"
									disabled={index === fields.length - 1}
								>
									<svg
										className="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</button>
								<div className="w-px h-6 bg-gray-200 mx-1"></div>
								<button
									type="button"
									title="Delete Field"
									onClick={() => deleteField(index)}
									className="bg-red-50 text-red-600 p-2 rounded-full hover:bg-red-600 hover:text-white transition-colors"
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
											strokeWidth="2"
											d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
										/>
									</svg>
								</button>
							</div>
						</div>

						<div className="flex flex-col gap-4">
							<div className="flex flex-col gap-2">
								<label className="text-sm font-bold text-gray-900">
									Field Label
								</label>
								<input
									type="text"
									value={field.label || ""}
									onChange={(e) => updateField(index, { label: e.target.value })}
									className="w-full border border-gray-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00abc0] text-sm text-gray-800"
									placeholder="Prompt text"
								/>
							</div>

							<div className="flex items-center justify-between gap-4 flex-wrap">
								<div className="flex items-center gap-3">
									<label className="text-sm font-bold text-gray-900">Type</label>
									<select
										value={field.type}
										onChange={(e) => {
											const type = e.target.value as ProgramFormFieldType;
											const next: Partial<ProgramFormField> = { type };
											if (supportsOptions(type)) {
												const options = safeArray<string>(field.options);
												next.options = options.length ? options : ["Option 1"];
											} else {
												next.options = [];
											}
											updateField(index, next);
										}}
										className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 bg-transparent"
									>
										<option value="short_answer">Short Answer</option>
										<option value="paragraph">Paragraph</option>
										<option value="multiple_choice">Multiple Choice</option>
										<option value="checkbox">Checkbox</option>
										<option value="date">Date</option>
										<option value="attachment">Attachment</option>
									</select>
								</div>

								<label className="flex items-center gap-2 text-sm font-bold text-gray-900">
									<input
										type="checkbox"
										checked={Boolean(field.required)}
										onChange={(e) =>
											updateField(index, { required: e.target.checked })
										}
										className="w-4 h-4"
									/>
									Required
								</label>
							</div>

							{supportsOptions(field.type) && (
								<div className="flex flex-col gap-3">
									<label className="text-sm font-bold text-gray-900">
										Options
									</label>
									{safeArray<string>(field.options).map((opt, optIndex) => (
										<div key={optIndex} className="flex items-center gap-2">
											<input
												type="text"
												value={opt}
												onChange={(e) => {
													const options = [...safeArray<string>(field.options)];
													options[optIndex] = e.target.value;
													updateField(index, { options });
												}}
												className="flex-1 border border-gray-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00abc0]"
												placeholder={`Option ${optIndex + 1}`}
											/>
											<button
												type="button"
												onClick={() => {
													const options = [...safeArray<string>(field.options)];
													options.splice(optIndex, 1);
													updateField(index, { options });
												}}
												className="px-3 py-2 rounded-lg bg-red-50 text-red-700 font-bold hover:bg-red-100"
												disabled={safeArray<string>(field.options).length <= 1}
												title="Remove option"
											>
												−
											</button>
										</div>
									))}
									<button
										type="button"
										onClick={() => {
											const options = [...safeArray<string>(field.options), ""];
											updateField(index, { options });
										}}
										className="w-fit text-sm font-bold text-[#00abc0] hover:text-black"
									>
										+ Add option
									</button>
								</div>
							)}
						</div>
					</div>
				))}

				<div className="sticky bottom-0 mt-4 pb-4 flex justify-end">
					<div className="bg-white/90 backdrop-blur border border-gray-200 rounded-full px-4 py-3 flex items-center gap-3 shadow-sm">
						<select
							value={newType}
							onChange={(e) => setNewType(e.target.value as ProgramFormFieldType)}
							className="border border-gray-300 rounded-full px-4 py-2 text-sm font-bold text-gray-800 bg-transparent"
						>
							<option value="short_answer">Short Answer</option>
							<option value="paragraph">Paragraph</option>
							<option value="multiple_choice">Multiple Choice</option>
							<option value="checkbox">Checkbox</option>
							<option value="date">Date</option>
							<option value="attachment">Attachment</option>
						</select>
						<button
							type="button"
							onClick={addField}
							className="bg-[#00abc0] hover:bg-[#0096a8] text-white text-sm font-bold py-2.5 px-6 rounded-full flex items-center gap-2 transition-transform transform hover:scale-105"
						>
							+ Add Field
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

// ─── MAIN EDITOR COMPONENT ──────────────────────────────────────

const ProgramEditor = () => {
	const [activeTab, setActiveTab] = useState<TabKey>("basic");
	const [program, setProgram] = useState<Program | null>(null);
	const [organization, setOrganization] = useState<{
		name?: string;
		logoUrl?: string;
	} | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const originalColorWasNumber = useRef(false);

	const params = useParams();
	const router = useRouter();
	const programId = params.id as string;

	const title = useMemo(
		() => (program?.name?.trim() ? program.name : "Untitled Program"),
		[program?.name],
	);

	const updateDraft = (patch: Partial<Program>) => {
		setProgram((prev) => (prev ? { ...prev, ...patch } : prev));
	};

	const toggleStatus = () => {
		setProgram((prev) => {
			if (!prev) return prev;
			const current = String(prev.programStatus || "Draft");
			const next = current === "Open" ? "Closed" : "Open";
			const ok = window.confirm(
				current === "Open"
					? "Close this program? Users will no longer be able to apply."
					: "Open this program? Users will be able to apply.",
			);
			if (!ok) return prev;
			return { ...prev, programStatus: next };
		});
	};

	const save = async () => {
		if (!program) return;
		if (!program.organizationId) {
			alert("Missing organizationId on this program.");
			return;
		}

		setIsSaving(true);
		try {
			const colorValue = originalColorWasNumber.current
				? toArgbIntFromHex(toColorInput(program.color))
				: toColorInput(program.color);

			await updateProgram(program.organizationId, programId, {
				name: program.name,
				category: program.category,
				deadline: program.deadline,
				color: colorValue,
				programStatus: program.programStatus,
				detailSections: safeArray(program.detailSections),
				formFields: safeArray(program.formFields),
				organizationId: program.organizationId,
			});
			alert("Saved.");
		} catch (error) {
			console.error("Failed to save program", error);
			alert("Failed to save. Check console for details.");
		} finally {
			setIsSaving(false);
		}
	};

	useEffect(() => {
		const fetchProgramData = async () => {
			if (!programId) return;
			try {
				const data = await getProgram(programId);
				if (data) {
					originalColorWasNumber.current = typeof (data as any).color === "number";
					const normalized: Program = {
						...data,
						deadline: (data as any).deadline || "",
						color: toColorInput((data as any).color),
						programStatus: (data as any).programStatus || "Draft",
						detailSections: safeArray<ProgramDetailSection>(
							(data as any).detailSections,
						),
						formFields: safeArray<ProgramFormField>((data as any).formFields),
					};
					setProgram(normalized);

					if (normalized.organizationId) {
						const org = await getOrganization(normalized.organizationId);
						setOrganization(org as any);
					}
				} else {
					setProgram(null);
				}
			} catch (error) {
				console.error("Failed to load program", error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchProgramData();
	}, [programId]);

	if (isLoading)
		return (
			<div className="flex h-screen items-center justify-center bg-[#f5f6f8]">
				Loading Editor...
			</div>
		);
	if (!program && !isLoading)
		return (
			<div className="flex h-screen items-center justify-center bg-[#f5f6f8]">
				Program not found. Check console for index errors!
			</div>
		);

	return (
		<div className="flex h-screen bg-[#f5f6f8] overflow-hidden font-sans">
			{/* ─── SIDEBAR ───────────────────────────────────────────── */}
			<aside className="w-64 bg-white shadow-lg flex flex-col h-full z-20 flex-shrink-0">
				<div className="bg-[#00abc0] flex flex-col items-center py-10 px-4">
					<div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-inner">
						<svg
							className="w-10 h-10 text-gray-400"
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
					<span className="text-xs font-bold text-white tracking-wider uppercase text-center">
						{title}
					</span>
				</div>

				<nav className="flex flex-col mt-4">
					<button
						onClick={() => setActiveTab("basic")}
						className={`w-full text-left px-8 py-4 font-bold text-sm transition-colors ${activeTab === "basic" ? "bg-[#00abc0] text-white" : "text-gray-500 hover:bg-gray-50"}`}
					>
						Basic
					</button>
					<button
						onClick={() => setActiveTab("details")}
						className={`w-full text-left px-8 py-4 font-bold text-sm transition-colors ${activeTab === "details" ? "bg-[#00abc0] text-white" : "text-gray-500 hover:bg-gray-50"}`}
					>
						Details
					</button>
					<button
						onClick={() => setActiveTab("form")}
						className={`w-full text-left px-8 py-4 font-bold text-sm transition-colors ${activeTab === "form" ? "bg-[#00abc0] text-white" : "text-gray-500 hover:bg-gray-50"}`}
					>
						Form
					</button>
				</nav>
			</aside>

			{/* ─── MAIN CONTENT AREA ─────────────────────────────────── */}
			<div className="flex-1 flex flex-col overflow-hidden">
				{/* ─── TOP NAVIGATION ───────────────────────────────────── */}
				<header className="bg-white h-20 shadow-sm flex items-center justify-between px-8 z-10 shrink-0">
					<div className="flex items-center gap-3 w-48">
						<Image src={"/unloquelogo.png"} alt="logo" width={24} height={24} />
						<span className="text-2xl font-bold text-gray-900 tracking-tight">
							Unloque
						</span>
					</div>
					<h1 className="text-xl font-bold text-gray-900">Program Editor</h1>
					<div className="w-48 flex justify-end">
						<button
							type="button"
							onClick={() => void save()}
							disabled={isSaving}
							className={`bg-black text-white text-sm font-bold py-2.5 px-8 rounded-full shadow-sm transition-colors ${isSaving ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-800"}`}
						>
							{isSaving ? "Saving..." : "Save"}
						</button>
					</div>
				</header>

				<main className="flex-1 overflow-x-hidden overflow-y-auto p-10">
					<div className="max-w-4xl mx-auto relative">
						<div className="flex justify-between items-start mb-6">
							<button
								onClick={() => router.back()}
								className="flex items-center gap-2 text-gray-500 hover:text-black font-semibold text-sm transition-colors"
							>
								<svg
									className="w-5 h-5"
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

							{(activeTab === "details" || activeTab === "form") && (
								<div className="flex flex-col gap-3">
									<button className="bg-[#00abc0] hover:bg-[#0096a8] text-white text-sm font-bold py-2.5 px-8 rounded-full flex items-center justify-center gap-2 shadow-sm">
										<svg
											className="w-4 h-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
											/>
										</svg>
										Save Form
									</button>
								</div>
							)}
						</div>

						<div>
							<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
								{title}
							</h1>
							<p className="text-gray-900 text-sm font-bold">
								{program?.category || "No Category"}
							</p>
						</div>

						{program && activeTab === "basic" && (
							<BasicEditorTab
								program={program}
								organization={organization}
								onChange={updateDraft}
								onToggleStatus={toggleStatus}
							/>
						)}

						{program && activeTab === "details" && (
							<DetailsEditorTab
								organizationId={program.organizationId}
								programId={programId}
								sections={safeArray(program.detailSections)}
								onChange={(next) => updateDraft({ detailSections: next })}
							/>
						)}

						{program && activeTab === "form" && (
							<FormEditorTab
								fields={safeArray(program.formFields)}
								onChange={(next) => updateDraft({ formFields: next })}
							/>
						)}
					</div>
				</main>
			</div>
		</div>
	);
};

export default ProgramEditor;
