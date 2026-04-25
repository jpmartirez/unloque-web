"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProgram } from "@/app/services/programService";
import type { Program } from "@/app/types/program";
import Image from "next/image";

// ─── TAB COMPONENTS ─────────────────────────────────────────────

const OverviewTab = ({ program }: { program: Program | null }) => (
	<div className="mt-8">
		<div className="flex items-baseline gap-3 mb-4">
			<h2 className="text-2xl font-bold text-gray-900">Overview</h2>
			<span className="text-[11px] text-gray-400 font-medium">
				Input basic information about your program
			</span>
		</div>

		<div className="bg-white rounded-3xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] p-8 md:p-10 border border-gray-100 flex flex-col gap-6">
			<div className="flex flex-col gap-2">
				<label className="text-lg font-bold text-gray-900">Program Name</label>
				<input
					type="text"
					defaultValue={program?.name || ""}
					className="w-full border border-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00abc0] text-sm text-gray-800"
				/>
			</div>

			<div className="flex flex-col gap-2">
				<label className="text-lg font-bold text-gray-900">Category</label>
				<div className="relative w-full md:max-w-md">
					<select
						className="w-full border border-gray-500 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-[#00abc0] bg-transparent text-gray-800 text-sm cursor-pointer"
						defaultValue={program?.category || "Education"}
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
						defaultValue={program?.deadline || ""}
						className="w-full border border-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00abc0] text-sm text-gray-800 appearance-none"
					/>
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<div className="flex items-baseline gap-2">
					<label className="text-lg font-bold text-gray-900">
						Program Color
					</label>
					<span className="text-[10px] text-gray-400 font-medium">
						This will be the color thats going to show in your program card.
					</span>
				</div>
				<button className="w-full md:max-w-md bg-[#00abc0] hover:bg-[#0096a8] text-white font-semibold py-3 px-4 rounded-xl transition-colors text-sm">
					Tap to change color
				</button>
			</div>
		</div>
	</div>
);

const DetailsTab = ({ program }: { program: Program | null }) => (
	<div className="mt-8">
		<div className="flex items-baseline gap-3 mb-4">
			<h2 className="text-2xl font-bold text-gray-900">Details Builder</h2>
			<span className="text-[11px] text-gray-400 font-medium">
				Create and Customize program details sections.
			</span>
		</div>
		<div className="bg-white rounded-3xl p-8 border border-gray-100 text-center text-gray-500">
			Details Builder Area (Data mapping goes here next!)
		</div>
	</div>
);

const FormTab = ({ program }: { program: Program | null }) => {
	const getTypeBadgeColor = (type: string) => {
		switch (type) {
			case "short_answer":
				return "bg-[#007b8a]";
			case "multiple_choice":
				return "bg-[#e68a00]";
			case "date":
				return "bg-[#6b21a8]";
			default:
				return "bg-gray-500";
		}
	};

	const formatTypeLabel = (type: string) => {
		return type
			.split("_")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};

	return (
		<div className="mt-8">
			<div className="flex items-baseline gap-3 mb-4">
				<h2 className="text-2xl font-bold text-gray-900">Form Builder</h2>
				<span className="text-[11px] text-gray-400 font-medium">
					Create and Customize application form fields.
				</span>
			</div>

			<div className="flex flex-col gap-6 relative pb-20">
				{(!program?.formFields || program.formFields.length === 0) && (
					<div className="bg-white rounded-3xl p-8 border border-gray-100 text-center text-gray-500">
						No form fields have been added to this program yet.
					</div>
				)}

				{program?.formFields?.map((field: any) => (
					<div
						key={field.id}
						className="bg-white rounded-3xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] p-8 border border-gray-100"
					>
						<div className="flex justify-between items-start mb-4">
							<div className="flex items-center gap-3">
								<span
									className={`${getTypeBadgeColor(field.type)} text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider`}
								>
									{formatTypeLabel(field.type)}
								</span>
								{field.required && (
									<span className="bg-[#f03a3a] text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
										Required
									</span>
								)}
							</div>
							<div className="flex items-center gap-3">
								<button className="text-gray-500 hover:text-black">
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
											d="M19 14l-7 7m0 0l-7-7m7 7V3"
										/>
									</svg>
								</button>
								<button className="bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700">
									<svg
										className="w-3.5 h-3.5"
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

						<h3 className="text-lg font-bold text-gray-900 mb-3">
							{field.label}
						</h3>

						{field.type === "short_answer" && (
							<input
								disabled
								type="text"
								placeholder="Short answer text"
								className="w-full border border-gray-400 rounded-lg px-4 py-2.5 text-sm bg-gray-50 cursor-not-allowed"
							/>
						)}
						{field.type === "date" && (
							<input
								disabled
								type="date"
								className="w-full border border-gray-400 rounded-lg px-4 py-2.5 text-sm bg-gray-50 cursor-not-allowed text-gray-400"
							/>
						)}
						{field.type === "multiple_choice" && field.options && (
							<div className="flex flex-col gap-2">
								{field.options.map((option: string, idx: number) => (
									<div key={idx} className="flex items-center gap-3">
										<div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
										<span className="text-sm text-gray-700">{option}</span>
									</div>
								))}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
};

// ─── MAIN EDITOR COMPONENT ──────────────────────────────────────

const ProgramEditor = () => {
	const [activeTab, setActiveTab] = useState<"overview" | "details" | "form">(
		"overview",
	);
	const [program, setProgram] = useState<Program | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const params = useParams();
	const router = useRouter();
	const programId = params.id as string;

	useEffect(() => {
		const fetchProgramData = async () => {
			if (!programId) return;
			try {
				const data = await getProgram(programId);
				setProgram(data);
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
						{program?.name}
					</span>
				</div>

				<nav className="flex flex-col mt-4">
					<button
						onClick={() => setActiveTab("overview")}
						className={`w-full text-left px-8 py-4 font-bold text-sm transition-colors ${activeTab === "overview" ? "bg-[#00abc0] text-white" : "text-gray-500 hover:bg-gray-50"}`}
					>
						Overview
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
				<header className="bg-white h-20 shadow-sm flex items-center justify-between px-8 z-10 flex-shrink-0">
					<div className="flex items-center gap-3 w-48">
						<Image src={"/unloquelogo.png"} alt="logo" width={24} height={24} />
						<span className="text-2xl font-bold text-gray-900 tracking-tight">
							Unloque
						</span>
					</div>
					<h1 className="text-xl font-bold text-gray-900">Program Editor</h1>
					<div className="w-48"></div>
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
								{program?.name || "Untitled Program"}
							</h1>
							<p className="text-gray-900 text-sm font-bold">
								{program?.category || "No Category"}
							</p>
						</div>

						{activeTab === "overview" && <OverviewTab program={program} />}
						{activeTab === "details" && <DetailsTab program={program} />}
						{activeTab === "form" && <FormTab program={program} />}
					</div>
				</main>
			</div>
		</div>
	);
};

export default ProgramEditor;
