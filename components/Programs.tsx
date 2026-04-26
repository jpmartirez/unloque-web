"use client";

import React, { useEffect, useState } from "react";
import {
	getProgramsByOrg,
	getOrganization,
	deleteProgram,
	getApplicationCountForProgram, // <-- IMPORT THIS!
} from "@/app/services/programService";
import type { Program } from "@/app/types/program";
import Link from "next/link";
import { useRouter } from "next/navigation";

// --- Reusable Program Card Component ---
interface ProgramCardProps {
	id: string;
	title: string;
	subtitle: string;
	applicationCount: string;
	startDate: string;
	dueDate: string;
	onDelete: (id: string) => void; // <-- NEW: Added onDelete prop
}

const ProgramCard: React.FC<ProgramCardProps> = ({
	id,
	title,
	subtitle,
	applicationCount,
	startDate,
	dueDate,
	onDelete,
}) => {
	return (
		<div className="bg-white rounded-3xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden border border-gray-100">
			{/* Top Section - Teal */}
			<div className="bg-[#00abc0] p-6 flex justify-between items-start">
				<div>
					<h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
					<p className="text-white/90 text-sm font-medium">{subtitle}</p>
				</div>

				{/* Action Buttons */}
				<div className="flex gap-2">
					{/* NEW: Attached the onClick event to the delete button */}
					<button
						onClick={() => onDelete(id)}
						className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-700 transition-colors shadow-sm"
					>
						<svg
							className="w-4 h-4 text-white"
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
					<Link
						href={`/programs/edit/${id}`}
						className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition-colors shadow-sm"
					>
						<svg
							className="w-4 h-4 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
							/>
						</svg>
					</Link>
				</div>
			</div>

			{/* Bottom Section - White */}
			<div className="p-6 flex flex-col gap-6">
				<div className="flex items-center gap-6">
					<div className="bg-[#0f6b75] rounded-xl p-3 flex flex-col items-center justify-center min-w-25 shadow-sm">
						<span className="text-white font-bold text-xl leading-tight">
							{applicationCount}
						</span>
						<span className="text-white/80 text-[10px] uppercase tracking-wider mt-1">
							Applications
						</span>
					</div>

					<div className="text-[11px] text-gray-400 font-medium leading-relaxed">
						<p>Application start: {startDate}</p>
						<p>Application due: {dueDate}</p>
					</div>
				</div>

				<div className="flex justify-end mt-2">
					<Link
						href={`/programs/${id}/applications`} // <-- Add this Link wrapper!
						className="bg-black hover:bg-gray-900 text-white text-xs font-bold py-3 px-6 rounded-full transition-colors shadow-sm block text-center"
					>
						View Applications
					</Link>
				</div>
			</div>
		</div>
	);
};

// --- Main Programs Page Component ---
const Programs: React.FC = () => {
	const [programs, setPrograms] = useState<
		(Program & { applicationCount: string })[]
	>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [orgName, setOrgName] = useState<string>("LOADING...");

	const router = useRouter();

	useEffect(() => {
		const fetchOrgData = async () => {
			const userOrgId = localStorage.getItem("userOrgId");
			if (userOrgId) {
				const orgData = await getOrganization(userOrgId);
				setOrgName(orgData?.name || "UNKNOWN ORG");
			}
		};

		const fetchPrograms = async () => {
			try {
				const userOrgId = localStorage.getItem("userOrgId");
				if (!userOrgId) {
					router.push("/");
					return;
				}

				// 1. Fetch the raw programs
				const data = await getProgramsByOrg(userOrgId);

				// 2. Fetch the application counts for all of them in parallel
				const programsWithCounts = await Promise.all(
					data.map(async (program) => {
						const count = await getApplicationCountForProgram(program.id);
						return {
							...program,
							applicationCount: count.toString(), // Attach the fresh count!
						};
					}),
				);

				// 3. Save the fully updated list to state
				setPrograms(programsWithCounts);
			} catch (err) {
				console.error("Error fetching programs:", err);
				setError("Failed to load programs.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchOrgData();
		fetchPrograms();
	}, [router]);

	// NEW: Function to navigate to creation page
	const handleAddProgram = () => {
		router.push("/programs/create");
	};

	// NEW: Function to handle deleting a program
	const handleDeleteProgram = async (programId: string) => {
		// 1. Ask for confirmation so they don't accidentally click it
		const confirmDelete = window.confirm(
			"Are you sure you want to delete this program? This action cannot be undone.",
		);
		if (!confirmDelete) return;

		const userOrgId = localStorage.getItem("userOrgId");
		if (!userOrgId) return;

		try {
			// 2. Delete it from Firebase
			await deleteProgram(userOrgId, programId);

			// 3. Remove it from the local React state instantly so it disappears from the screen
			setPrograms((prevPrograms) =>
				prevPrograms.filter((program) => program.id !== programId),
			);
		} catch (error) {
			console.error("Error deleting program:", error);
			alert("An error occurred while trying to delete the program.");
		}
	};

	const filteredPrograms = programs.filter((program) => {
		const query = searchQuery.toLowerCase();
		const programName = program.name?.toLowerCase() || "";
		const category = program.category?.toLowerCase() || "";
		return programName.includes(query) || category.includes(query);
	});

	return (
		<div className="flex flex-col gap-8 pb-12 w-full max-w-250">
			{/* Header Section */}
			<div>
				<h1 className="text-4xl font-bold text-gray-900 mb-2">{orgName}</h1>
				<p className="text-gray-600 text-sm font-medium">
					Keep track of your programs. Add or modify details of your
					applications.
				</p>
			</div>

			{/* Toolbar */}
			<div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-2">
				<div className="relative w-full md:max-w-xl">
					<input
						type="text"
						placeholder="Search programs"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full bg-gray-200/70 border-none rounded-full py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#00abc0] transition-shadow placeholder-gray-400 font-medium"
					/>
					<svg
						className="w-5 h-5 text-gray-500 absolute left-4 top-3"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2.5"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				</div>

				<div className="flex items-center gap-3 shrink-0">
					<button className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center hover:bg-gray-100 transition-colors">
						<svg
							className="w-6 h-6 text-black"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2.5"
								d="M12 4v16m8-8H4"
							/>
						</svg>
					</button>
					<button
						onClick={handleAddProgram}
						className="bg-black text-white font-semibold py-2.5 px-8 rounded-full text-sm transition-colors shadow-sm hover:bg-gray-800"
					>
						Add Program
					</button>
				</div>
			</div>

			{/* Active Programs Section */}
			<div className="mt-4">
				<div className="flex items-baseline gap-2 mb-6">
					<h2 className="text-2xl font-bold text-gray-900">Active Programs</h2>
					<span className="text-[11px] text-gray-400 font-medium">
						(programs that are currently accepting applications)
					</span>
				</div>

				{isLoading && <p className="text-gray-500">Loading programs...</p>}
				{error && <p className="text-red-500">{error}</p>}

				{!isLoading && !error && filteredPrograms.length === 0 && (
					<p className="text-gray-500">
						{searchQuery
							? "No programs found matching your search."
							: "No active programs found."}
					</p>
				)}

				{/* Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{filteredPrograms.map((program) => {
						const start = program.createdAt?.seconds
							? new Date(program.createdAt.seconds * 1000).toLocaleDateString()
							: new Date(program.createdAt as string).toLocaleDateString();

						const due = program._deadline
							? new Date(program._deadline).toLocaleDateString()
							: "TBA";

						return (
							<ProgramCard
								id={program.id}
								key={program.id}
								title={program.name}
								subtitle={program.category}
								startDate={start}
								dueDate={due}
								applicationCount={program.applicationCount || "0"}
								onDelete={handleDeleteProgram} // <-- PASS FUNCTION TO CARD
							/>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default Programs;
