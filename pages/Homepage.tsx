"use client";

import Navbar from "@/components/Navbar";
import React, { FormEvent, MouseEvent, useState } from "react";
import { useRouter } from "next/navigation";

const Homepage = () => {
	const router = useRouter();
	const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);

	const handleLogin = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		router.replace("/dashboard");
	};

	const handleForgotPassword = (event: MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		router.replace("/forgot-password");
	};

	const handleBackdropClose = (event: MouseEvent<HTMLDivElement>) => {
		if (event.target === event.currentTarget) {
			setIsInstructionsModalOpen(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />

			<main className="flex flex-col md:flex-row justify-center items-center max-w-6xl mx-auto p-8 gap-12 md:gap-24 min-h-[75vh]">
				{/* Left Section - Login Form */}
				<section className="flex-1 w-full max-w-112.5">
					<h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome!</h1>
					<p className="text-lg text-gray-900 mb-8">
						To get started, please log in to your account.
					</p>

					<form className="flex flex-col gap-5" onSubmit={handleLogin}>
						{/* Email Input */}
						<div className="flex flex-col gap-2">
							<label
								htmlFor="email"
								className="text-sm text-gray-900 font-medium"
							>
								Organization Email
							</label>
							<input
								type="email"
								id="email"
								className="w-full border border-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00abc0] transition-shadow"
							/>
						</div>

						{/* Password Input */}
						<div className="flex flex-col gap-2">
							<label
								htmlFor="password"
								className="text-sm text-gray-900 font-medium"
							>
								Password
							</label>
							<input
								type="password"
								id="password"
								className="w-full border border-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00abc0] transition-shadow"
							/>
						</div>

						{/* Forgot Password */}
						<div className="flex justify-end">
							<button
								type="button"
								className="text-[#8c1c1c] text-sm font-bold hover:underline"
								onClick={handleForgotPassword}
							>
								Forgot Password?
							</button>
						</div>

						{/* Login Button */}
						<button
							type="submit"
							className="mt-2 bg-[#0f0f0f] hover:bg-black text-white font-semibold py-3 px-15 rounded-full w-max transition-colors cursor-pointer"
						>
							Login
						</button>
					</form>
				</section>

				{/* Right Section - Announcement Card */}
				<aside className="flex-1 w-full max-w-112.5">
					{/* Card Container with soft shadow */}
					<div className="flex flex-col rounded-xl overflow-hidden shadow-[0_15px_50px_-12px_rgba(0,0,0,0.15)]">
						{/* Top Teal Half */}
						<div className="bg-[#00abc0] p-8 text-white">
							<h2 className="text-2xl font-semibold mb-3 border-b border-white/60 pb-2">
								Announcement
							</h2>
							<p className="text-sm leading-relaxed mb-6 font-medium">
								We are pleased to inform you that each of you will be receiving
								a unique Employee ID and password. This will allow you to log in
								to our companys website easily.
							</p>
							<button
								type="button"
								className="bg-[#0f0f0f] hover:bg-black text-white text-sm font-semibold py-2 px-8 rounded-full transition-colors"
								onClick={() => setIsInstructionsModalOpen(true)}
							>
								Instructions
							</button>
						</div>

						{/* Bottom White Half */}
						<div className="bg-white p-8">
							<p className="text-gray-900 font-bold text-sm leading-relaxed mb-6">
								Stay informed on system updates and new functionalities here.
							</p>
							<div className="text-xs text-gray-700 leading-relaxed">
								<span className="font-bold text-gray-900">Note:</span>
								<br />
								If you have any problems with your account. Please contact your
								IT department.
							</div>
						</div>
					</div>
				</aside>
			</main>

			{isInstructionsModalOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
					onClick={handleBackdropClose}
				>
					<div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
						<h3 className="text-xl font-semibold text-gray-900">Instructions</h3>
						<p className="mt-4 text-sm leading-relaxed text-gray-700">
							Use your organization email and password to sign in. If this is
							your first time, coordinate with your IT department for your
							account credentials.
						</p>
						<div className="mt-6 flex justify-end gap-3">
							<button
								type="button"
								className="rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
								onClick={() => setIsInstructionsModalOpen(false)}
							>
								Cancel
							</button>
							<button
								type="button"
								className="rounded-full bg-[#0f0f0f] px-5 py-2 text-sm font-semibold text-white hover:bg-black"
								onClick={() => setIsInstructionsModalOpen(false)}
							>
								OK
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Homepage;
