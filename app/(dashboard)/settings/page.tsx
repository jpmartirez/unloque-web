"use client";

import React, { useState } from "react";

const Settings: React.FC = () => {
	// State to manage password visibility toggles
	const [showCurrent, setShowCurrent] = useState(false);
	const [showNew, setShowNew] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);

	return (
		<div className="flex flex-col gap-8 pb-12 w-full max-w-225">
			{/* Header */}
			<div>
				<h1 className="text-4xl font-bold text-gray-900 mb-2">
					Account Settings
				</h1>
			</div>

			{/* Preferences Card */}
			<div className="bg-white rounded-3xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] p-8 border border-gray-100">
				<h2 className="text-2xl font-bold text-gray-900 mb-6">Preferences</h2>

				<div className="flex flex-col gap-2">
					<label htmlFor="language" className="text-lg font-bold text-gray-900">
						Language
					</label>
					<div className="relative w-full md:max-w-md">
						<select
							id="language"
							className="w-full border border-gray-500 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-[#00abc0] bg-transparent text-gray-800 text-sm font-medium cursor-pointer"
							defaultValue="English"
						>
							<option value="English">English</option>
							<option value="Spanish">Spanish</option>
							<option value="Tagalog">Tagalog</option>
						</select>
						{/* Custom Dropdown Arrow */}
						<div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
							<svg
								className="w-5 h-5 text-gray-800"
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
			</div>

			{/* Change Password Card */}
			<div className="bg-white rounded-3xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] p-8 border border-gray-100">
				<h2 className="text-2xl font-bold text-gray-900 mb-6">
					Change Password
				</h2>

				<div className="flex flex-col gap-6">
					{/* Current Password */}
					<div className="flex flex-col gap-2">
						<label className="text-lg font-bold text-gray-900">
							Current Password
						</label>
						<div className="relative w-full">
							<input
								type={showCurrent ? "text" : "password"}
								
								className="w-full border border-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00abc0] bg-transparent text-gray-800 font-medium tracking-wider"
							/>
							<button
								type="button"
								onClick={() => setShowCurrent(!showCurrent)}
								className="absolute inset-y-0 right-4 flex items-center text-gray-800 hover:text-black transition-colors"
							>
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									{showCurrent ? (
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
										/>
									) : (
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
										/>
									)}
								</svg>
							</button>
						</div>
					</div>

					{/* New & Confirm Password Row */}
					<div className="flex flex-col md:flex-row gap-6">
						{/* New Password */}
						<div className="flex-1 flex flex-col gap-2">
							<label className="text-lg font-bold text-gray-900">
								New Password
							</label>
							<div className="relative w-full">
								<input
									type={showNew ? "text" : "password"}
									className="w-full border border-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00abc0] bg-transparent text-gray-800 font-medium tracking-wider"
								/>
								<button
									type="button"
									onClick={() => setShowNew(!showNew)}
									className="absolute inset-y-0 right-4 flex items-center text-gray-800 hover:text-black transition-colors"
								>
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
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
										/>
									</svg>
								</button>
							</div>
						</div>

						{/* Confirm Password */}
						<div className="flex-1 flex flex-col gap-2">
							<label className="text-lg font-bold text-gray-900">
								Confirm Password
							</label>
							<div className="relative w-full">
								<input
									type={showConfirm ? "text" : "password"}
									className="w-full border border-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00abc0] bg-transparent text-gray-800 font-medium tracking-wider"
								/>
								<button
									type="button"
									onClick={() => setShowConfirm(!showConfirm)}
									className="absolute inset-y-0 right-4 flex items-center text-gray-800 hover:text-black transition-colors"
								>
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
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
										/>
									</svg>
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Save Button */}
			<div className="flex justify-end mt-2">
				<button className="bg-[#0f0f0f] hover:bg-black text-white font-bold py-3.5 px-16 rounded-full transition-colors text-base shadow-md">
					Save
				</button>
			</div>

			{/* Footer Copyright */}
			<div className="mt-12 text-center text-gray-400 text-[11px] font-medium">
				© 2026 Unloque. All rights reserved.
			</div>
		</div>
	);
};

export default Settings;
