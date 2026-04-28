"use client";

import React, { useEffect, useState } from "react";
import StatCard from "./StatCard";
import {
	getDashboardStats,
	getOrganization,
} from "@/app/services/programService";

const Dashboard: React.FC = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [orgName, setOrgName] = useState("Admin");
	const [stats, setStats] = useState({
		totalBeneficiaries: 0,
		verifiedUsers: 0,
		pendingApplications: 0,
		approvedApplications: 0,
		declinedApplications: 0,
		demographics: { male: 0, female: 0 },
	});

	useEffect(() => {
		const fetchDashboardData = async () => {
			const orgId = localStorage.getItem("userOrgId");
			if (!orgId) return;

			try {
				// Fetch Org Name
				const orgData = await getOrganization(orgId);
				if (orgData?.name) setOrgName(orgData.name);

				// Fetch Aggregated Stats
				const dashboardStats = await getDashboardStats(orgId);
				setStats(dashboardStats);
			} catch (error) {
				console.error("Failed to fetch dashboard stats", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchDashboardData();
	}, []);

	// --- Dynamic Chart Calculations ---
	const totalApps =
		stats.pendingApplications +
		stats.approvedApplications +
		stats.declinedApplications;

	// Calculate percentages for the Progress Chart (default to gray if 0)
	const approvedPct =
		totalApps === 0
			? 0
			: Math.round((stats.approvedApplications / totalApps) * 100);
	const pendingPct =
		totalApps === 0
			? 0
			: Math.round((stats.pendingApplications / totalApps) * 100);
	const declinedPct =
		totalApps === 0
			? 0
			: Math.round((stats.declinedApplications / totalApps) * 100);

	const progressGradient =
		totalApps === 0
			? "conic-gradient(#e5e7eb 0% 100%)"
			: `conic-gradient(#5ce1e6 0% ${approvedPct}%, #00d2ff ${approvedPct}% ${approvedPct + pendingPct}%, #c8f5f6 ${approvedPct + pendingPct}% 100%)`;

	// Calculate percentages for the Demographics Chart
	const totalPeople = stats.demographics.male + stats.demographics.female;
	const malePct =
		totalPeople === 0
			? 0
			: Math.round((stats.demographics.male / totalPeople) * 100);
	const femalePct =
		totalPeople === 0
			? 0
			: Math.round((stats.demographics.female / totalPeople) * 100);

	const demoGradient =
		totalPeople === 0
			? "conic-gradient(#e5e7eb 0% 100%)"
			: `conic-gradient(#ff0000 0% ${malePct}%, #ff8a8a ${malePct}% 100%)`;

	if (isLoading)
		return (
			<div className="p-10 font-medium text-gray-500 animate-pulse">
				Loading Dashboard Data...
			</div>
		);

	return (
		<div className="flex flex-col gap-8 pb-12 font-sans">
			{/* Welcome Header */}
			<div>
				<h1 className="text-4xl font-bold text-gray-900 mb-2">
					Welcome! {orgName}
				</h1>
				<p className="text-gray-600 font-medium">
					Monitor your programs metrics and track regional development progress
					across Quezon Province.
				</p>
			</div>

			<h2 className="text-2xl font-bold text-gray-900 -mb-2">Dashboard</h2>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<StatCard
					title="Total Beneficiaries"
					value={stats.totalBeneficiaries.toLocaleString()}
					iconColor="bg-[#00abc0]"
				/>
				<StatCard
					title="No. Completed Applicants"
					value={stats.verifiedUsers.toLocaleString()}
					iconColor="bg-[#00abc0]"
				/>
				<StatCard
					title="Pending Applications"
					value={stats.pendingApplications.toLocaleString()}
					iconColor="bg-[#00abc0]"
					isAlert={stats.pendingApplications > 0} // Only alert if there's actually pending apps!
				/>
			</div>

			{/* Charts Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Application Progress Chart Card */}
				<div className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] flex flex-col border border-gray-100">
					<div className="flex items-center gap-4 mb-8">
						<div className="w-10 h-10 rounded-xl bg-[#00abc0] text-white flex items-center justify-center shadow-sm">
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
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								/>
							</svg>
						</div>
						<h3 className="text-gray-500 font-bold text-sm uppercase tracking-wider leading-tight">
							Application
							<br />
							Progress
						</h3>
					</div>

					<div className="flex-1 flex justify-center items-center gap-8">
						{/* Dynamic Pie Chart */}
						<div
							className="w-40 h-40 rounded-full shadow-inner relative flex items-center justify-center"
							style={{ background: progressGradient }}
						>
							{/* Inner white circle to make it a donut chart (optional, remove if you want a full pie) */}
							<div className="w-20 h-20 bg-white rounded-full"></div>
						</div>

						{/* Dynamic Legend */}
						<div className="flex flex-col gap-3">
							<div className="flex items-center gap-2 text-xs font-bold text-gray-600">
								<div className="w-3 h-3 rounded-full bg-[#5ce1e6]"></div>
								Approved ({approvedPct}%)
							</div>
							<div className="flex items-center gap-2 text-xs font-bold text-gray-600">
								<div className="w-3 h-3 rounded-full bg-[#00d2ff]"></div>
								Pending ({pendingPct}%)
							</div>
							<div className="flex items-center gap-2 text-xs font-bold text-gray-600">
								<div className="w-3 h-3 rounded-full bg-[#c8f5f6]"></div>
								Declined ({declinedPct}%)
							</div>
						</div>
					</div>
				</div>

				{/* Demographics Chart Card */}
				<div className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] flex flex-col border border-gray-100">
					<div className="flex items-center gap-4 mb-8">
						<div className="w-10 h-10 rounded-xl bg-[#00abc0] text-white flex items-center justify-center shadow-sm">
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
									d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
								/>
							</svg>
						</div>
						<h3 className="text-gray-500 font-bold text-sm uppercase tracking-wider leading-tight">
							Demographics of
							<br />
							Applicants
						</h3>
					</div>

					<div className="flex-1 flex justify-center items-center gap-8">
						{/* Dynamic Pie Chart */}
						<div
							className="w-40 h-40 rounded-full shadow-inner"
							style={{ background: demoGradient }}
						></div>

						{/* Dynamic Legend */}
						<div className="flex flex-col gap-3">
							<div className="flex items-center gap-2 text-xs font-bold text-gray-600">
								<div className="w-3 h-3 rounded-full bg-[#ff0000]"></div>
								Male ({malePct}%)
							</div>
							<div className="flex items-center gap-2 text-xs font-bold text-gray-600">
								<div className="w-3 h-3 rounded-full bg-[#ff8a8a]"></div>
								Female ({femalePct}%)
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
