import React from "react";
import StatCard from "./StatCard";

const Dashboard: React.FC = () => {
	return (
		<div className="flex flex-col gap-8 pb-12">
			{/* Welcome Header */}
			<div>
				<h1 className="text-4xl font-bold text-gray-900 mb-2">
					Welcome! John Doe
				</h1>
				<p className="text-gray-600">
					Monitor social welfare metrics and track regional development progress
					across Quezon Province.
				</p>
			</div>

			<h2 className="text-2xl font-bold text-gray-900 -mb-2">Dashboard</h2>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<StatCard
					title="Total Beneficiaries"
					value="123,453"
					iconColor="bg-[#00abc0]"
				/>
				<StatCard
					title="No. Verified Users"
					value="107,207"
					iconColor="bg-[#00abc0]"
				/>
				<StatCard
					title="Pending Applications"
					value="200,896"
					iconColor="bg-[#00abc0]"
					isAlert={true}
				/>
			</div>

			{/* Charts Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Application Progress Chart Card */}
				<div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] flex flex-col">
					<div className="flex items-center gap-3 mb-8">
						<div className="w-8 h-8 rounded bg-[#00abc0] text-white flex items-center justify-center">
							{/* Spinner icon placeholder */}
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
						<h3 className="text-gray-500 font-medium">
							Application
							<br />
							Progress
						</h3>
					</div>

					<div className="flex-1 flex justify-center items-center">
						{/* CSS Pie Chart using conic-gradient */}
						<div
							className="w-48 h-48 rounded-full"
							style={{
								background:
									"conic-gradient(#5ce1e6 0% 20%, #00d2ff 20% 55%, #c8f5f6 55% 100%)",
							}}
						></div>
					</div>
				</div>

				{/* Demographics Chart Card */}
				<div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] flex flex-col">
					<div className="flex items-center gap-3 mb-8">
						<div className="w-8 h-8 rounded bg-[#00abc0] text-white flex items-center justify-center">
							{/* Gender icon placeholder */}
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
						<h3 className="text-gray-500 font-medium">
							Demographics of
							<br />
							Applicants
						</h3>
					</div>

					<div className="flex-1 flex justify-center items-center">
						{/* CSS Pie Chart using conic-gradient */}
						<div
							className="w-48 h-48 rounded-full"
							style={{
								background: "conic-gradient(#ff8a8a 0% 43%, #ff0000 43% 100%)",
							}}
						></div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
