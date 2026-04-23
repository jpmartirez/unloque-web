import React from "react";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

interface LayoutProps {
	children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
	return (
		<div className="flex h-screen bg-[#f5f6f8] overflow-hidden font-sans">
			{/* Fixed Sidebar */}
			<Sidebar />

			{/* Main Content Area */}
			<div className="flex-1 flex flex-col overflow-hidden">
				{/* Fixed Top Navigation */}
				<TopNav />

				{/* Scrollable Content */}
				<main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
					<div className="max-w-7xl mx-auto">{children}</div>
				</main>
			</div>
		</div>
	);
};

export default Layout;
