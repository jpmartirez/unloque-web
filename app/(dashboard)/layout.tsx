import React from "react";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex h-screen overflow-hidden">
			{/* Fixed Sidebar */}
			<Sidebar />

			{/* Main Content Area */}
			<div className="flex-1 flex flex-col overflow-hidden">
				{/* Fixed Top Navigation */}
				<TopNav />

				{/* Scrollable Content where your Pages drop in */}
				<main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
					<div className="max-w-7xl mx-auto">{children}</div>
				</main>
			</div>
		</div>
	);
}
