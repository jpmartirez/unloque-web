"use client";

import Navbar from "@/components/Navbar";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/utils/firebase"; // Make sure this path is correct for your app!
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const Homepage = () => {
	// 1. Setup state for the form inputs and UI feedback
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const router = useRouter();

	// 2. The main login function
	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault(); // Prevent the page from refreshing
		setError(null);
		setIsLoading(true);

		try {
			// Step A: Log the user into Firebase Auth
			const userCredential = await signInWithEmailAndPassword(
				auth,
				email,
				password,
			);
			const user = userCredential.user;

			// Step B: Fetch their profile from the "users" collection to get their orgId
			const userDocRef = doc(db, "users", user.uid);
			const userDocSnap = await getDoc(userDocRef);

			if (userDocSnap.exists()) {
				const userData = userDocSnap.data();
				const orgId = userData.organizationId;

				// Step C: Save the orgId somewhere globally accessible.
				// LocalStorage is the easiest starting point before moving to React Context.
				if (typeof window !== "undefined") {
					localStorage.setItem("userOrgId", orgId);
					localStorage.setItem("userRole", userData.role); // Optional: save role too
				}

				// Step D: Send them to the dashboard!
				router.push("/dashboard");
			} else {
				// They logged in, but have no database profile
				setError("Account configuration error. Please contact IT.");
				auth.signOut(); // Force them back out
			}
		} catch (err: any) {
			console.error("Login Error:", err);
			setError("Invalid email or password. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />

			<main className="flex flex-col md:flex-row justify-center items-center max-w-6xl mx-auto p-8 gap-12 md:gap-24 min-h-[75vh]">
				<section className="flex-1 w-full max-w-112.5">
					<h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome!</h1>
					<p className="text-lg text-gray-900 mb-8">
						To get started, please log in to your account.
					</p>

					{/* Show error messages if they fail to log in */}
					{error && (
						<div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
							{error}
						</div>
					)}

					{/* 3. Connect the form to the handleLogin function */}
					<form onSubmit={handleLogin} className="flex flex-col gap-5">
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
								value={email}
								onChange={(e) => setEmail(e.target.value)} // Bind state
								required
								className="w-full border border-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00abc0] transition-shadow"
							/>
						</div>

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
								value={password}
								onChange={(e) => setPassword(e.target.value)} // Bind state
								required
								className="w-full border border-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00abc0] transition-shadow"
							/>
						</div>

						<div className="flex justify-end">
							<button
								type="button"
								className="text-[#8c1c1c] text-sm font-bold hover:underline"
							>
								Forgot Password?
							</button>
						</div>

						{/* Disable button while loading to prevent double-clicks */}
						<button
							type="submit"
							disabled={isLoading}
							className={`mt-2 bg-[#0f0f0f] text-white font-semibold py-3 px-15 rounded-full w-max transition-colors ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-black cursor-pointer"}`}
						>
							{isLoading ? "Logging in..." : "Login"}
						</button>
					</form>
				</section>

				{/* Right Section - Announcement Card (Unchanged) */}
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
		</div>
	);
};

export default Homepage;
