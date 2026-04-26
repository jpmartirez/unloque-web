"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
	getProgram,
	getProgramApplications,
	type ApplicationWithUser,
} from "@/app/services/programService";
import type { Program } from "@/app/types/program";

const ViewApplicationsPage = () => {
	const router = useRouter();
	const params = useParams();
	const programId = params?.programId as string;

	const [program, setProgram] = useState<Program | null>(null);
	const [applications, setApplications] = useState<ApplicationWithUser[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Filters
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("Ongoing"); // Matches your DB status

	useEffect(() => {
		const fetchData = async () => {
			if (!programId) return;

			try {
				// Fetch the program info (for the Title) and the Applications in parallel
				const [programData, applicationsData] = await Promise.all([
					getProgram(programId),
					getProgramApplications(programId),
				]);

				setProgram(programData);
				setApplications(applicationsData);
			} catch (error) {
				console.error("Error fetching applications:", error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchData();
	}, [programId]);

	// Format Timestamp safely
	const formatTimestamp = (timestamp: any) => {
		if (!timestamp) return "N/A";
		// Handle Firebase Timestamp objects
		if (timestamp.seconds) {
			return new Date(timestamp.seconds * 1000).toLocaleString();
		}
		// Handle string dates
		return new Date(timestamp).toLocaleString();
	};

	// Filter Logic
	const filteredApps = applications.filter((app) => {
		const query = searchQuery.toLowerCase();
		const matchesSearch =
			app.applicationId.toLowerCase().includes(query) ||
			app.username.toLowerCase().includes(query) ||
			app.email.toLowerCase().includes(query);

		const matchesStatus = statusFilter === "All" || app.status === statusFilter;

		return matchesSearch && matchesStatus;
	});

	const ongoingCount = applications.filter(
		(app) => app.status === "Ongoing",
	).length;

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center bg-[#f5f6f8] text-gray-500 font-medium">
				Loading Applications...
			</div>
		);
	}

	return (
		<div className="flex flex-col min-h-screen p-8 font-sans items-center">
			<div className="w-full max-w-6xl">
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

				{/* Top Header & Stats */}
				<div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
					<div>
						<h1 className="text-4xl font-bold text-gray-900 mb-2">
							{program?.name || "Program"}
						</h1>
						<p className="text-gray-600 text-sm font-medium">
							{program?.category || "Scholarship"}
						</p>
					</div>

					<div className="flex flex-col items-end gap-3">
						<div className="text-gray-900">
							<span className="text-2xl font-bold">{applications.length}</span>
							<span className="text-sm font-medium ml-2">Total Applicants</span>
						</div>
						<div className="bg-[#00abc0] text-white px-8 py-4 rounded-xl shadow-md flex items-center gap-3">
							<span className="text-3xl font-bold">{ongoingCount}</span>
							<span className="text-sm font-semibold">Ongoing applicants</span>
						</div>
					</div>
				</div>

				{/* Toolbar */}
				<div className="flex flex-col md:flex-row items-center gap-4 mb-4">
					{/* Search */}
					<div className="relative w-full max-w-md">
						<input
							type="text"
							placeholder="Search applicant ID / applicants"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full bg-white border border-gray-200 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#00abc0]"
						/>
						<svg
							className="w-4 h-4 text-gray-400 absolute left-4 top-3.5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
					</div>

					{/* Filter Icon */}
					<button className="bg-white border border-gray-200 p-2.5 rounded-full hover:bg-gray-50 text-gray-500">
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
								d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
							/>
						</svg>
					</button>

					{/* Status Dropdown */}
					<div className="relative">
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="bg-[#00abc0] text-white text-sm font-semibold py-2.5 pl-6 pr-10 rounded-full appearance-none cursor-pointer outline-none"
						>
							<option value="All">All Statuses</option>
							<option value="Ongoing">Ongoing</option>
							<option value="Accepted">Accepted</option>
							<option value="Rejected">Rejected</option>
						</select>
						<div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-white">
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

				{/* Data Table */}
				<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full text-left border-collapse">
							<thead>
								<tr className="bg-[#00abc0] text-white">
									<th className="py-4 px-6 font-semibold text-sm">
										Application ID
									</th>
									<th className="py-4 px-6 font-semibold text-sm">Username</th>
									<th className="py-4 px-6 font-semibold text-sm">Email</th>
									<th className="py-4 px-6 font-semibold text-sm">Status</th>
									<th className="py-4 px-6 font-semibold text-sm">
										Submission Timestamp
									</th>
								</tr>
							</thead>
							<tbody className="text-sm text-gray-800">
								{filteredApps.length === 0 ? (
									<tr>
										<td
											colSpan={5}
											className="py-8 text-center text-gray-400 font-medium"
										>
											No applicants found.
										</td>
									</tr>
								) : (
									filteredApps.map((app, index) => (
										<tr
											key={index}
											className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
										>
											<td className="py-4 px-6 font-medium text-[#00abc0]">
												{app.applicationId}
											</td>
											<td className="py-4 px-6 capitalize">{app.username}</td>
											<td className="py-4 px-6">{app.email}</td>
											<td className="py-4 px-6">
												<span
													className={`px-3 py-1 rounded-full text-xs font-bold ${app.status === "Ongoing" ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-600"}`}
												>
													{app.status}
												</span>
											</td>
											<td className="py-4 px-6 text-gray-500">
												{formatTimestamp(app.createdAt)}
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ViewApplicationsPage;
