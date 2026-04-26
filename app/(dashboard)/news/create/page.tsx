"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createNews } from "@/app/services/newsService";
import { getProgramsByOrg } from "@/app/services/programService";
import type { Program } from "@/app/types/program";

const CreateNewsPage = () => {
	const router = useRouter();

	// Form State
	const [headline, setHeadline] = useState("");
	const [category, setCategory] = useState("Education");
	const [date, setDate] = useState("");
	const [imageUrl, setImageUrl] = useState("");
	const [newsUrl, setNewsUrl] = useState("");
	const [programId, setProgramId] = useState(""); // For linking to a specific program

	// Data State
	const [programs, setPrograms] = useState<Program[]>([]);
	const [isSaving, setIsSaving] = useState(false);
	const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);

	// Fetch programs so the admin can link the news to one
	useEffect(() => {
		const fetchPrograms = async () => {
			const orgId = localStorage.getItem("userOrgId");
			if (!orgId) return;

			try {
				const data = await getProgramsByOrg(orgId);
				setPrograms(data);
				if (data.length > 0) {
					setProgramId(data[0].id); // Default to the first program
				}
			} catch (error) {
				console.error("Failed to load programs", error);
			} finally {
				setIsLoadingPrograms(false);
			}
		};

		fetchPrograms();
	}, []);

	const handleSave = async () => {
		if (!headline || !date || !programId) {
			alert("Headline, Date, and Related Program are required.");
			return;
		}

		const orgId = localStorage.getItem("userOrgId");
		if (!orgId) {
			alert("Organization ID missing. Please log in again.");
			return;
		}

		setIsSaving(true);

		try {
			const newsData = {
				headline,
				category,
				date,
				imageUrl,
				newsUrl,
				programId, // Securely attaches the news to the specific program!
			};

			await createNews(orgId, newsData);
			router.back(); // Send back to news list upon success
		} catch (error) {
			console.error("Error creating news:", error);
			alert("Failed to save news.");
			setIsSaving(false);
		}
	};

	return (
		<div className="flex flex-col min-h-screen p-8 font-sans items-center">
			<div className="w-full max-w-4xl">
				{/* Back Button */}
				<button
					onClick={() => router.back()}
					className="flex items-center gap-2 text-gray-500 hover:text-black font-semibold text-sm mb-6 transition-colors"
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

				<h1 className="text-3xl font-bold text-gray-900 mb-8">Create News</h1>

				{/* Form Card */}
				<div className="bg-white rounded-2xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] p-8 md:p-10">
					<div className="flex flex-col gap-6">
						{/* Headline */}
						<div>
							<label className="block text-lg font-bold text-gray-900 mb-2">
								Headline
							</label>
							<input
								type="text"
								placeholder="e.g. DOST eyes AI-powered PH by 2028"
								value={headline}
								onChange={(e) => setHeadline(e.target.value)}
								className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00abc0] transition-colors"
							/>
						</div>

						{/* Category & Date Row */}
						<div className="flex flex-col md:flex-row gap-6">
							<div className="flex-1">
								<label className="block text-lg font-bold text-gray-900 mb-2">
									Category
								</label>
								<div className="relative">
									<select
										value={category}
										onChange={(e) => setCategory(e.target.value)}
										className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm appearance-none bg-transparent focus:outline-none focus:ring-2 focus:ring-[#00abc0] cursor-pointer"
									>
										<option value="Education">Education</option>
										<option value="Health">Health</option>
										<option value="Research">Research</option>
										<option value="Healthcare">Healthcare</option>
									</select>
									<div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
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
												d="M19 9l-7 7-7-7"
											/>
										</svg>
									</div>
								</div>
							</div>

							<div className="flex-1">
								<label className="block text-lg font-bold text-gray-900 mb-2">
									Date
								</label>
								<input
									type="date"
									value={date}
									onChange={(e) => setDate(e.target.value)}
									className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00abc0]"
								/>
							</div>
						</div>

						{/* Related Program Dropdown (NEW) */}
						<div>
							<label className="block text-lg font-bold text-gray-900 mb-2">
								Related Program
							</label>
							<div className="relative">
								<select
									value={programId}
									onChange={(e) => setProgramId(e.target.value)}
									disabled={isLoadingPrograms}
									className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm appearance-none bg-transparent focus:outline-none focus:ring-2 focus:ring-[#00abc0] cursor-pointer disabled:bg-gray-50 disabled:text-gray-400"
								>
									{isLoadingPrograms ? (
										<option value="">Loading programs...</option>
									) : programs.length === 0 ? (
										<option value="">No programs available</option>
									) : (
										programs.map((prog) => (
											<option key={prog.id} value={prog.id}>
												{prog.name}
											</option>
										))
									)}
								</select>
								<div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
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
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</div>
							</div>
						</div>

						{/* Image URL */}
						<div>
							<label className="block text-lg font-bold text-gray-900 mb-2">
								Image URL link
							</label>
							<input
								type="text"
								placeholder="Paste image link here"
								value={imageUrl}
								onChange={(e) => setImageUrl(e.target.value)}
								className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00abc0] text-gray-600"
							/>
						</div>

						{/* News URL */}
						<div>
							<label className="block text-lg font-bold text-gray-900 mb-2">
								News URL link
							</label>
							<input
								type="text"
								placeholder="Paste original article link here"
								value={newsUrl}
								onChange={(e) => setNewsUrl(e.target.value)}
								className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00abc0] text-gray-600"
							/>
						</div>
					</div>
				</div>

				{/* Save Button */}
				<div className="flex justify-end mt-6">
					<button
						onClick={handleSave}
						disabled={isSaving}
						className={`bg-black text-white text-sm font-bold py-3.5 px-12 rounded-full transition-colors shadow-lg active:scale-95 ${isSaving ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"}`}
					>
						{isSaving ? "Saving..." : "Save News"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default CreateNewsPage;
