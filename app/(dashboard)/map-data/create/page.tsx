"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createMapData } from "@/app/services/mapDataService";
import type { Program } from "@/app/types/program";
import { getProgramsByOrg } from "@/app/services/programService";

// Full list of Quezon Province municipalities extracted from your database
const QUEZON_MUNICIPALITIES = [
	"Agdangan",
	"Alabat",
	"Atimonan",
	"Buenavista",
	"Burdeos",
	"Calauag",
	"Candelaria",
	"Catanauan",
	"Dolores",
	"General Luna",
	"General Nakar",
	"Guinayangan",
	"Gumaca",
	"Infanta",
	"Jomalig",
	"Lopez",
	"Lucban",
	"Lucena City",
	"Macalelon",
	"Mauban",
	"Mulanay",
	"Padre Burgos",
	"Pagbilao",
	"Panukulan",
	"Patnanungan",
	"Perez",
	"Pitogo",
	"Plaridel",
	"Polillo",
	"Quezon",
	"Real",
	"Sampaloc",
	"San Andres",
	"San Antonio",
	"San Francisco",
	"San Narciso",
	"Sariaya",
	"Tagkawayan",
	"Tayabas City",
	"Tiaong",
	"Unisan",
];

const CreateMapDataPage = () => {
	const router = useRouter();

	// Data State
	const [programs, setPrograms] = useState<Program[]>([]);
	const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);
	const [isSaving, setIsSaving] = useState(false);

	// Form State
	const [selectedProgramId, setSelectedProgramId] = useState("");
	const [title, setTitle] = useState("");

	// Initialize an object to hold the counts for all 41 municipalities (default empty)
	const [counts, setCounts] = useState<Record<string, number | "">>(
		QUEZON_MUNICIPALITIES.reduce(
			(acc, current) => ({ ...acc, [current]: "" }),
			{},
		),
	);

	// Fetch the organization's programs on load
	useEffect(() => {
		const fetchPrograms = async () => {
			const orgId = localStorage.getItem("userOrgId");
			if (!orgId) {
				router.push("/");
				return;
			}

			try {
				const data = await getProgramsByOrg(orgId);
				setPrograms(data);
				if (data.length > 0) {
					setSelectedProgramId(data[0].id);
					setTitle(`${data[0].name} Beneficiaries`);
				}
			} catch (error) {
				console.error("Failed to fetch programs", error);
			} finally {
				setIsLoadingPrograms(false);
			}
		};

		fetchPrograms();
	}, [router]);

	// Handle program selection change to auto-update the title
	const handleProgramChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newProgId = e.target.value;
		setSelectedProgramId(newProgId);

		const selectedProg = programs.find((p) => p.id === newProgId);
		if (selectedProg) {
			setTitle(`${selectedProg.name} Beneficiaries`);
		}
	};

	// Calculate the total dynamically
	const totalBeneficiaries = Object.values(counts).reduce(
		(sum, val) => sum + (Number(val) || 0),
		0,
	);

	const handleSave = async () => {
		if (!selectedProgramId || !title) {
			alert("Please select a program and provide a title.");
			return;
		}

		const orgId = localStorage.getItem("userOrgId");
		if (!orgId) return;

		setIsSaving(true);

		const selectedProg = programs.find((p) => p.id === selectedProgramId);

		try {
			// Clean up the counts (convert empty strings to 0)
			const cleanCounts: Record<string, number> = {};
			for (const [city, value] of Object.entries(counts)) {
				cleanCounts[city] = Number(value) || 0;
			}

			// Build the exact format for your database
			const mapDataPayload = {
				...cleanCounts,
				"Total Beneficiaries": totalBeneficiaries,
				organizationId: orgId,
				programId: selectedProgramId,
				programName: selectedProg?.name || "",
				title: title,
				type: "beneficiaries",
			};

			await createMapData(mapDataPayload);
			router.push("/map-data"); // Redirect back to the dashboard
		} catch (error) {
			console.error("Failed to create map data", error);
			alert("Failed to save map data.");
			setIsSaving(false);
		}
	};

	return (
		<div className="flex flex-col min-h-screen  p-8 font-sans items-center pb-20">
			<div className="w-full max-w-5xl">
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

				<div className="flex justify-between items-end mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-900 mb-2">
							Add Map Data
						</h1>
						<p className="text-gray-500 text-sm font-medium">
							Log beneficiary counts across Quezon Province.
						</p>
					</div>
					<div className="bg-[#00abc0] text-white px-6 py-3 rounded-xl shadow-md flex items-center gap-3">
						<span className="text-2xl font-bold">
							{totalBeneficiaries.toLocaleString()}
						</span>
						<span className="text-xs font-semibold uppercase tracking-wider">
							Total
							<br />
							Beneficiaries
						</span>
					</div>
				</div>

				{/* Section 1: General Information */}
				<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
					<h2 className="text-xl font-bold text-gray-900 mb-6">
						General Information
					</h2>
					<div className="flex flex-col md:flex-row gap-6">
						{/* Select Program */}
						<div className="flex-1">
							<label className="block text-sm font-bold text-gray-900 mb-2">
								Select Program <span className="text-red-500">*</span>
							</label>
							<div className="relative">
								<select
									value={selectedProgramId}
									onChange={handleProgramChange}
									disabled={isLoadingPrograms}
									className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#00abc0] cursor-pointer"
								>
									{isLoadingPrograms ? (
										<option value="">Loading...</option>
									) : programs.length === 0 ? (
										<option value="">No programs available</option>
									) : (
										programs.map((p) => (
											<option key={p.id} value={p.id}>
												{p.name}
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

						{/* Title */}
						<div className="flex-1">
							<label className="block text-sm font-bold text-gray-900 mb-2">
								Display Title <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00abc0]"
							/>
						</div>
					</div>
				</div>

				{/* Section 2: Municipalities Inputs */}
				<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
					<div className="flex justify-between items-baseline mb-6">
						<h2 className="text-xl font-bold text-gray-900">
							Municipality Breakdown
						</h2>
						<p className="text-xs text-gray-400 font-medium">
							Leave blank for zero.
						</p>
					</div>

					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-4">
						{QUEZON_MUNICIPALITIES.map((city) => (
							<div key={city} className="flex flex-col gap-1">
								<label className="text-xs font-bold text-gray-600 truncate">
									{city}
								</label>
								<input
									type="number"
									min="0"
									placeholder="0"
									value={counts[city]}
									onChange={(e) =>
										setCounts({
											...counts,
											[city]:
												e.target.value === "" ? "" : Number(e.target.value),
										})
									}
									className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00abc0] transition-colors"
								/>
							</div>
						))}
					</div>
				</div>

				{/* Save Button */}
				<div className="flex justify-end mt-8 sticky bottom-8">
					<button
						onClick={handleSave}
						disabled={isSaving}
						className={`bg-black text-white text-sm font-bold py-4 px-16 rounded-full shadow-2xl transition-all transform active:scale-95 ${isSaving ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"}`}
					>
						{isSaving ? "Saving Data..." : "Publish Map Data"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default CreateMapDataPage;
