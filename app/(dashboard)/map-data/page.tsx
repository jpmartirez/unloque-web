"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
	getMapDataByOrg,
	deleteMapData,
	updateMapData,
} from "@/app/services/mapDataService";

const MapDataDashboard = () => {
	const [mapData, setMapData] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	// Edit Modal State for Program Names
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editingItem, setEditingItem] = useState<any>(null);
	const [editTitle, setEditTitle] = useState("");
	const [editSubtitle, setEditSubtitle] = useState("");

	useEffect(() => {
		const fetchData = async () => {
			const orgId = localStorage.getItem("userOrgId");
			if (!orgId) return;

			try {
				const data = await getMapDataByOrg(orgId);
				setMapData(data);
			} catch (error) {
				console.error("Error fetching map data:", error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchData();
	}, []);

	const handleDelete = async (id: string) => {
		if (!window.confirm("Are you sure you want to delete this map data?"))
			return;
		try {
			await deleteMapData(id);
			setMapData((prev) => prev.filter((item) => item.id !== id));
		} catch (error) {
			console.error("Failed to delete", error);
		}
	};

	const openEditModal = (item: any) => {
		setEditingItem(item);
		setEditTitle(item.title || "");
		setEditSubtitle(item.programName || "");
		setIsEditModalOpen(true);
	};

	const fetchData = async () => {
		const orgId = localStorage.getItem("userOrgId");
		if (!orgId) return;

		try {
			const data = await getMapDataByOrg(orgId);
			setMapData(data);
		} catch (error) {
			console.error("Error fetching map data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSaveEdit = async () => {
		if (!editingItem) return;
		try {
			await updateMapData(editingItem.id, {
				title: editTitle,
				programName: editSubtitle,
			});
			setIsEditModalOpen(false);
			fetchData(); // Refresh data
		} catch (error) {
			console.error("Failed to update", error);
		}
	};

	const filteredData = mapData.filter((item) =>
		(item.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()),
	);

	return (
		<div className="flex flex-col gap-8 pb-12 w-full max-w-6xl mx-auto p-8 font-sans">
			<div>
				<h1 className="text-4xl font-bold text-gray-900 mb-2">DOST Map Data</h1>
				<p className="text-gray-600 text-sm font-medium">
					View number of beneficiaries in Quezon Province.
				</p>
			</div>

			<div className="flex flex-col md:flex-row justify-between items-center gap-4">
				<div className="relative w-full md:max-w-xl">
					<input
						type="text"
						placeholder="Search program"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full bg-gray-100 border-none rounded-full py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#00abc0]"
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

				<div className="flex items-center gap-3">
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
					<button className="bg-black hover:bg-gray-800 text-white font-semibold py-2.5 px-8 rounded-full text-sm shadow-sm transition-colors">
						Add Data
					</button>
				</div>
			</div>

			<div className="mt-4">
				<div className="flex items-baseline gap-2 mb-6">
					<h2 className="text-2xl font-bold text-gray-900">
						Program Beneficiaries
					</h2>
					<span className="text-[11px] text-gray-400 font-medium">
						(see number of beneficiaries per program)
					</span>
				</div>

				{isLoading ? (
					<p className="text-gray-500">Loading map data...</p>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{filteredData.map((item) => (
							<div
								key={item.id}
								className="bg-white rounded-2xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden border border-gray-100"
							>
								<div className="bg-[#00abc0] p-6 flex justify-between items-start">
									<div>
										<h3 className="text-2xl font-bold text-white mb-1">
											{item.title}
										</h3>
										<p className="text-white/90 text-sm">{item.programName}</p>
									</div>
									<div className="flex gap-2">
										<button
											onClick={() => handleDelete(item.id)}
											className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-700 shadow-sm"
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
										<button
											onClick={() => openEditModal(item)}
											className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 shadow-sm"
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
										</button>
									</div>
								</div>
								<div className="p-6 flex justify-end mt-4">
									<Link
										href={`/map-data/${item.id}`}
										className="bg-black text-white text-xs font-bold py-3 px-6 rounded-full hover:bg-gray-800 transition-colors shadow-sm"
									>
										View Beneficiaries
									</Link>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Quick Edit Modal for Card Details */}
			{isEditModalOpen && (
				<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
						<h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
							Edit Program Data
						</h3>
						<div className="flex flex-col gap-4 mb-8">
							<div>
								<label className="block text-sm font-bold text-gray-900 mb-2">
									Title
								</label>
								<input
									type="text"
									value={editTitle}
									onChange={(e) => setEditTitle(e.target.value)}
									className="w-full border border-gray-400 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#00abc0] outline-none"
								/>
							</div>
							<div>
								<label className="block text-sm font-bold text-gray-900 mb-2">
									Subtitle / Program Name
								</label>
								<input
									type="text"
									value={editSubtitle}
									onChange={(e) => setEditSubtitle(e.target.value)}
									className="w-full border border-gray-400 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#00abc0] outline-none"
								/>
							</div>
						</div>
						<div className="flex justify-end gap-3">
							<button
								onClick={() => setIsEditModalOpen(false)}
								className="px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-full"
							>
								Cancel
							</button>
							<button
								onClick={handleSaveEdit}
								className="px-8 py-3 bg-[#00abc0] text-white text-sm font-bold rounded-full hover:bg-[#0096a8]"
							>
								Save
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default MapDataDashboard;
