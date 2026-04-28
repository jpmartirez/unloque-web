"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createProgram } from "@/app/services/programService";
import type { Program } from "@/app/types/program";
import { PROGRAM_CATEGORIES } from "@/app/constants/categories";

const CreateProgramPage = () => {
	const router = useRouter();

	// Form State
	const [name, setName] = useState("");
	const [category, setCategory] = useState(PROGRAM_CATEGORIES[0]);
	const [deadline, setDeadline] = useState("");
	const [color, setColor] = useState("#00abc0"); // Default DOST Teal
	const [isCreating, setIsCreating] = useState(false);

	const handleCreate = async () => {
		// Validation to ensure they filled out the required fields
		if (!name || !category || !deadline) {
			alert("Please fill out all required fields.");
			return;
		}

		setIsCreating(true);

		try {
			const userOrgId = localStorage.getItem("userOrgId");
			if (!userOrgId) {
				alert("Organization ID not found. Please log in again.");
				router.push("/");
				return;
			}

			// Structure the data based on your database requirements
			const newProgramData: Omit<Program, "id" | "createdAt" | "lastUpdated"> = {
				name: name,
				category: category,
				deadline: deadline, // Saved as string (YYYY-MM-DD)
				color: color,
				organizationId: userOrgId, // Tied securely to their organization!
				programStatus: "Closed", // Stored as Open/Closed in Firestore
				formFields: [],
				detailSections: [],
			};

			// Save to Firebase and get the generated Document ID
			const newProgramId = await createProgram(newProgramData);

			// Redirect them to the Editor so they can add forms/details
			router.push(`/programs/edit/${newProgramId}`);
		} catch (error) {
			console.error("Failed to create program:", error);
			alert("Failed to create program. Please try again.");
			setIsCreating(false);
		}
	};

	return (
		// Changed bg to white and added justify-center to center the hero section
		<div className="flex flex-col min-h-screen bg-white font-sans justify-center">
			{/* ─── MAIN CONTENT (Hero Section) ──────────────────────── */}
			<main className="w-full max-w-4xl mx-auto p-10 flex flex-col">
				{/* Logo and Back Button Row */}
				<div className="flex items-center justify-between mb-8">
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
				</div>

				<div className="w-full text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						Add New Program
					</h1>
				</div>

				{/* Header Texts */}
				<div className="flex items-baseline gap-3 mb-6">
					<h2 className="text-2xl font-bold text-gray-900">Overview</h2>
					<span className="text-[11px] text-gray-400 font-medium">
						Input basic information about your program
					</span>
				</div>

				{/* Form Card (Removed shadow and border since background is white now) */}
				<div className="bg-white rounded-3xl p-8 md:p-10 border border-gray-200 flex flex-col gap-8 shadow-sm">
					{/* Program Name */}
					<div className="flex flex-col gap-2">
						<label className="text-lg font-bold text-gray-900 flex items-center gap-2">
							Program Name{" "}
							<span className="text-[#d93025] text-[10px] italic">
								Required
							</span>
						</label>
						<input
							type="text"
							placeholder="e.g. DOST-SEI JLSS 2026"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="w-full border border-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00abc0] transition-shadow bg-transparent"
						/>
					</div>

					{/* Category */}
					<div className="flex flex-col gap-2">
						<label className="text-lg font-bold text-gray-900 flex items-center gap-2">
							Category{" "}
							<span className="text-[#d93025] text-[10px] italic">
								Required
							</span>
						</label>
						<div className="relative w-full md:max-w-md">
							<select
								value={category}
								onChange={(e) => setCategory(e.target.value)}
								className="w-full border border-gray-400 rounded-xl px-4 py-3 text-sm appearance-none bg-transparent focus:outline-none focus:ring-2 focus:ring-[#00abc0] cursor-pointer"
							>
								{PROGRAM_CATEGORIES.map((opt) => (
									<option key={opt} value={opt}>
										{opt}
									</option>
								))}
							</select>
							<div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-900">
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
										d="M19 9l-7 7-7-7"
									/>
								</svg>
							</div>
						</div>
					</div>

					{/* Deadline */}
					<div className="flex flex-col gap-2">
						<label className="text-lg font-bold text-gray-900 flex items-center gap-2">
							Deadline{" "}
							<span className="text-[#d93025] text-[10px] italic">
								Required
							</span>
						</label>
						<div className="relative w-full md:max-w-md">
							<input
								type="date"
								value={deadline}
								onChange={(e) => setDeadline(e.target.value)}
								className="w-full border border-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00abc0] bg-transparent"
							/>
						</div>
					</div>

					{/* Program Color */}
					<div className="flex flex-col gap-2">
						<div className="flex items-baseline gap-2">
							<label className="text-lg font-bold text-gray-900">
								Program Color
							</label>
							<span className="text-[10px] text-gray-400 font-medium">
								This will be the color thats going to show in your program card.
							</span>
						</div>
						<div className="flex items-center gap-4">
							<input
								type="color"
								value={color}
								onChange={(e) => setColor(e.target.value)}
								className="w-12 h-12 rounded cursor-pointer border-none p-0"
								title="Choose a color"
							/>
							<button className="md:max-w-md bg-[#00abc0] hover:bg-[#0096a8] text-white font-semibold py-3 px-6 rounded-xl transition-colors text-sm flex-1 text-center">
								Tap to change color
							</button>
						</div>
					</div>
				</div>

				{/* Create Program Button */}
				<div className="flex justify-end mt-8">
					<button
						onClick={handleCreate}
						disabled={isCreating}
						className={`bg-black text-white text-sm font-bold py-4 px-16 rounded-full shadow-lg transition-all transform active:scale-95 ${isCreating ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"}`}
					>
						{isCreating ? "Creating..." : "Create Program"}
					</button>
				</div>
			</main>

			{/* Footer */}
			<footer className="text-center py-6 text-gray-400 text-xs font-medium">
				© 2026 Unloque. All rights reserved.
			</footer>
		</div>
	);
};

export default CreateProgramPage;
