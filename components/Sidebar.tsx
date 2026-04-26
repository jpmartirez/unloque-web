"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
// 1. Import useRouter to handle the redirect
import { usePathname, useRouter } from "next/navigation";
// 2. Import your Firebase auth tools
import { auth, db } from "@/utils/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Sidebar = () => {
	const pathname = usePathname();
	const router = useRouter();
	const [userEmail, setUserEmail] = useState<string>("Loading...");
	const [orgLogoUrl, setOrgLogoUrl] = useState<string | null>(null);

	const navItems = [
		{ name: "Home", path: "/dashboard" },
		{ name: "Programs", path: "/programs" },
		{ name: "News", path: "/news" },
		{ name: "Map Data", path: "/map-data" },
		{ name: "Settings", path: "/settings" },
		{ name: "Support & Help Center", path: "/support" },
	];

	useEffect(() => {
		if (typeof window !== "undefined") {
			const savedEmail = localStorage.getItem("userEmail");
			const savedOrgId = localStorage.getItem("userOrgId");
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setUserEmail(savedEmail ?? "Unknown User");

			const loadOrgLogo = async () => {
				if (!savedOrgId) return;
				try {
					const snap = await getDoc(doc(db, "organizations", savedOrgId));
					if (!snap.exists()) return;
					const data = snap.data() as Record<string, unknown>;
					const url = data["logoUrl"] ?? data["_logoURL"];
					if (typeof url === "string" && url.trim()) {
						setOrgLogoUrl(url);
					}
				} catch (error) {
					console.error("Error loading organization logo:", error);
				}
			};

			loadOrgLogo();
		}
	}, []);

	// 3. Create the logout function
	const handleLogout = async () => {
		try {
			await signOut(auth);

			localStorage.removeItem("userOrgId");
			localStorage.removeItem("userRole");
			localStorage.removeItem("userEmail");

			router.push("/");
		} catch (error) {
			console.error("Error logging out:", error);
		}
	};

	return (
		<aside className="w-64 bg-white shadow-lg flex flex-col h-screen z-10">
			{/* User Profile Section */}
			<div className="bg-[#00abc0] flex flex-col items-center py-10 px-4">
				<div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center mb-4 shadow-inner">
					{orgLogoUrl ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={orgLogoUrl}
							alt="Organization logo"
							className="w-full h-full object-cover rounded-xl"
						/>
					) : (
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
					)}
				</div>
				{/* NEW: Display the dynamic email state here */}
				<span className="text-sm font-bold text-white truncate w-full text-center px-2">
					{userEmail}
				</span>
			</div>

			{/* Navigation Links using Next.js Link */}
			<nav className="flex-1 mt-6">
				<ul className="flex flex-col">
					{navItems.map((item) => {
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

			{/* 4. Attach the function to the onClick handler */}
			<button
				onClick={handleLogout}
				className="bg-[#b83232] text-white py-4 px-6 text-left font-semibold hover:bg-red-800 transition-colors w-full mt-auto"
			>
				Logout
			</button>
		</aside>
	);
};

export default Sidebar;
