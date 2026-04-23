"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {
	const pathname = usePathname(); // Gets the current URL path

	const navItems = [
		{ name: "Home", path: "/dashboard" },
		{ name: "Programs", path: "/programs" },
		{ name: "News", path: "/news" },
		{ name: "Map Data", path: "/map-data" },
		{ name: "Settings", path: "/settings" },
		{ name: "Support & Help Center", path: "/support" },
	];

	return (
		<aside className="w-64 bg-white shadow-lg flex flex-col h-screen z-10">
			{/* User Profile Section */}
			<div className="bg-[#00abc0] flex flex-col items-center py-10 px-4">
				<div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-inner">
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

			{/* Navigation Links using Next.js Link */}
			<nav className="flex-1 mt-6">
				<ul className="flex flex-col">
					{navItems.map((item) => {
						// Check if the current URL matches the link's path
						const isActive = pathname === item.path;

						return (
							<li key={item.name}>
								<Link
									href={item.path}
									className={`block px-6 py-4 font-semibold transition-colors ${
										isActive
											? "bg-[#00abc0] text-white"
											: "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
									}`}
								>
									{item.name}
								</Link>
							</li>
						);
					})}
				</ul>
			</nav>

			{/* Logout Button */}
			<button className="bg-[#b83232] text-white py-4 px-6 text-left font-semibold hover:bg-red-800 transition-colors w-full mt-auto">
				Logout
			</button>
		</aside>
	);
};

export default Sidebar;
