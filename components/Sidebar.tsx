import React from "react";

const Sidebar: React.FC = () => {
	const navItems = [
		"Programs",
		"News",
		"Map Data",
		"Settings",
		"Support & Help Center",
	];

	return (
		<aside className="w-64 bg-white shadow-lg flex flex-col h-full z-10">
			{/* User Profile Section */}
			<div className="bg-[#00abc0] flex flex-col items-center py-10 px-4">
				<div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-inner">
					{/* Simple SVG icon for user */}
					<svg
						className="w-10 h-10 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
						/>
					</svg>
				</div>
				<span className="text-sm font-medium text-black">
					example@email.corporate.com
				</span>
			</div>

			{/* Navigation Links */}
			<nav className="flex-1 mt-6">
				<ul>
					<li className="bg-[#00abc0] text-white px-6 py-3 font-semibold cursor-pointer">
						Home
					</li>
					{navItems.map((item) => (
						<li
							key={item}
							className="px-6 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-800 cursor-pointer font-medium transition-colors"
						>
							{item}
						</li>
					))}
				</ul>
			</nav>

			{/* Logout Button */}
			<button className="bg-[#b83232] text-white py-4 px-6 text-left font-semibold hover:bg-red-800 transition-colors w-full">
				Logout
			</button>
		</aside>
	);
};

export default Sidebar;
