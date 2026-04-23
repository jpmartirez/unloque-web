import React from "react";

const TopNav: React.FC = () => {
	return (
		<header className="bg-white h-20 shadow-sm flex items-center justify-between px-8 z-10">
			{/* Logo Area */}
			<div className="flex items-center gap-3">
				{/* Placeholder for Unloque Logo */}
				<div className="w-8 h-8 rounded bg-linear-to-br from-blue-500 to-orange-400"></div>
				<span className="text-2xl font-bold text-gray-900 tracking-tight">
					Unloque
				</span>
			</div>

			{/* Search Bar */}
			<div className="relative w-96">
				<input
					type="text"
					placeholder="Search programs/news etc."
					className="w-full bg-gray-100 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#00abc0]"
				/>
				<svg
					className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
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
		</header>
	);
};

export default TopNav;
