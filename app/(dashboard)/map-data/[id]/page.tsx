"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMapDataById, updateMapData } from "@/app/services/mapDataService";

const BeneficiariesPage = () => {
	const params = useParams();
	const router = useRouter();
	const id = params.id as string;

	const [data, setData] = useState<any>(null);
	const [municipalities, setMunicipalities] = useState<
		{ name: string; count: number }[]
	>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	// Modal State
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modMunicipality, setModMunicipality] = useState("");
	const [modCount, setModCount] = useState<number | "">("");

	// Fields to ignore when mapping municipalities
	const metadataKeys = [
		"organizationId",
		"programId",
		"programName",
		"title",
		"type",
		"updatedAt",
		"Total Beneficiaries",
		"id",
	];

	useEffect(() => {
		const fetchData = async () => {
			try {
				const rawData = await getMapDataById(id);
				if (rawData) {
					setData(rawData);
					// Extract only the dynamic municipality fields
					const extracted = Object.entries(rawData)
						.filter(([key]) => !metadataKeys.includes(key))
						.map(([name, count]) => ({ name, count: Number(count) }))
						.sort((a, b) => a.name.localeCompare(b.name));
					setMunicipalities(extracted);
				}
			} catch (error) {
				console.error("Failed to load map data", error);
			} finally {
				setIsLoading(false);
			}
		};
		if (id) fetchData();
	}, [id]);

	const fetchData = async () => {
		try {
			const rawData = await getMapDataById(id);
			if (rawData) {
				setData(rawData);
				// Extract only the dynamic municipality fields
				const extracted = Object.entries(rawData)
					.filter(([key]) => !metadataKeys.includes(key))
					.map(([name, count]) => ({ name, count: Number(count) }))
					.sort((a, b) => a.name.localeCompare(b.name));
				setMunicipalities(extracted);
			}
		} catch (error) {
			console.error("Failed to load map data", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSaveModification = async () => {
		if (!modMunicipality || modCount === "") {
			alert("Please provide both a municipality and a count.");
			return;
		}

		try {
			const countNum = Number(modCount);

			// 1. Prepare updated object with new municipality value
			const updatedData = { ...data, [modMunicipality]: countNum };

			// 2. Recalculate "Total Beneficiaries" safely
			const newTotal = Object.entries(updatedData)
				.filter(([key]) => !metadataKeys.includes(key))
				.reduce((sum, [_, val]) => sum + Number(val), 0);

			updatedData["Total Beneficiaries"] = newTotal;

			// 3. Save to Firebase
			await updateMapData(id, {
				[modMunicipality]: countNum,
				"Total Beneficiaries": newTotal,
			});

			// 4. Close modal and refresh UI
			setIsModalOpen(false);
			setModMunicipality("");
			setModCount("");
			fetchData();
		} catch (error) {
			console.error("Error saving data:", error);
			alert("Failed to save changes.");
		}
	};

	const filteredMunicipalities = municipalities.filter((m) =>
		m.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	if (isLoading) return <div className="p-10 text-center">Loading Data...</div>;
	if (!data)
		return <div className="p-10 text-center text-red-500">Data not found.</div>;

	return (
		<div className="flex flex-col min-h-screen p-8 font-sans items-center relative">
			<div className="w-full max-w-6xl">
				{/* Back Button */}
				<button
					onClick={() => router.back()}
					className="flex items-center gap-2 text-gray-500 hover:text-black font-semibold text-sm mb-6 transition-colors"
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

				{/* Header & Total Stats */}
				<div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
					<div>
						<h1 className="text-4xl font-bold text-gray-900 mb-2">
							{data.title} Beneficiaries
						</h1>
						<p className="text-gray-600 text-sm font-medium">
							View number of beneficiaries of {data.title} in Quezon Province.
						</p>
					</div>

					<div className="bg-[#00abc0] text-white px-8 py-4 rounded-xl shadow-md flex items-center gap-3">
						<span className="text-3xl font-bold">
							{data["Total Beneficiaries"]?.toLocaleString() || 0}
						</span>
						<span className="text-sm font-medium">Total Beneficiaries</span>
					</div>
				</div>

				{/* Toolbar */}
				<div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
					<div className="relative w-full md:max-w-md">
						<input
							type="text"
							placeholder="Search municipality"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full bg-gray-200/70 border-none rounded-full py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#00abc0]"
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
					<button
						onClick={() => setIsModalOpen(true)}
						className="bg-black hover:bg-gray-800 text-white font-semibold py-3 px-10 rounded-full text-sm shadow-sm transition-colors shrink-0"
					>
						Modify Data
					</button>
				</div>

				{/* Grid of Municipalities */}
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
					{filteredMunicipalities.map((item, idx) => (
						<div
							key={idx}
							className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
						>
							<div className="bg-[#00abc0] py-2 px-4">
								<h3 className="text-white text-xs font-semibold truncate">
									{item.name}
								</h3>
							</div>
							<div className="p-4 flex flex-col">
								<span className="text-lg font-bold text-gray-900">
									{item.count.toLocaleString()}
								</span>
								<span className="text-[10px] text-gray-500 font-medium">
									Beneficiaries
								</span>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* --- MODIFY DATA MODAL --- */}
			{isModalOpen && (
				<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
						{/* Top Accent Line */}
						<div className="h-2 w-full bg-[#00abc0]"></div>

						<div className="p-8">
							<div className="flex justify-between items-center mb-6">
								<h2 className="text-xl font-bold text-gray-900 text-center w-full">
									Modify Data Municipality
								</h2>
							</div>

							<div className="flex flex-col gap-5">
								<div>
									<label className="block text-sm font-bold text-gray-900 mb-2">
										Municipality
									</label>
									{/* Using a datalist allows selecting existing OR typing a brand new one! */}
									<input
										type="text"
										list="municipalities-list"
										placeholder="Select or type new municipality"
										value={modMunicipality}
										onChange={(e) => setModMunicipality(e.target.value)}
										className="w-full border border-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00abc0]"
									/>
									<datalist id="municipalities-list">
										{municipalities.map((m) => (
											<option key={m.name} value={m.name} />
										))}
									</datalist>
								</div>

								<div>
									<label className="block text-sm font-bold text-gray-900 mb-2">
										Number of Beneficiaries
									</label>
									<input
										type="number"
										placeholder="0"
										value={modCount}
										onChange={(e) =>
											setModCount(
												e.target.value === "" ? "" : Number(e.target.value),
											)
										}
										className="w-full border border-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00abc0]"
									/>
								</div>
							</div>

							<div className="flex justify-center mt-8 gap-3">
								<button
									onClick={() => setIsModalOpen(false)}
									className="px-6 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
								>
									Cancel
								</button>
								<button
									onClick={handleSaveModification}
									className="bg-[#00abc0] hover:bg-[#0096a8] text-white text-sm font-bold py-3 px-12 rounded-full shadow-md transition-colors"
								>
									Save
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default BeneficiariesPage;
