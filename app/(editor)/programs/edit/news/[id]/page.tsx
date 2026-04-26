"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
	getSingleNews,
	updateNews,
	type NewsItem,
} from "@/app/services/programService";
import { deleteNews } from "@/app/services/newsService";

const EditNewsPage = () => {
	const router = useRouter();
	const params = useParams();
	const newsId = params?.id as string;

	const [newsData, setNewsData] = useState<Partial<NewsItem>>({
		headline: "",
		category: "Education",
		date: "",
		imageUrl: "",
		newsUrl: "",
	});
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);

	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		const fetchNews = async () => {
			if (!newsId) {
				console.log("FETCHED NEWS: No news ID provided");
				setIsLoading(false);
				return;
			}
			try {
				const data = await getSingleNews(newsId);
				console.log("FETCHED NEWS:", data);
				if (data) setNewsData(data);
			} catch (error) {
				console.error("Error fetching news:", error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchNews();
	}, [newsId]);

	// --- CRITICAL: This allows you to type in the inputs ---
	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;
		setNewsData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSave = async () => {
		setIsSaving(true);
		try {
			await updateNews(newsId, newsData);
			// Redirect back to the news list after successful save
			router.back();
		} catch (error) {
			console.error("Error updating news:", error);
			alert("Failed to save changes. Please try again.");
			setIsSaving(false);
		}
	};

	if (isLoading)
		return (
			<div className="flex h-screen items-center justify-center bg-[#f5f6f8]">
				<div className="text-gray-500 font-medium animate-pulse">
					Opening Editor...
				</div>
			</div>
		);

	const handleDelete = async () => {
		const confirmDelete = window.confirm(
			"Are you sure you want to delete this news article? This cannot be undone.",
		);
		if (!confirmDelete) return;

		const orgId = localStorage.getItem("userOrgId");
		if (!orgId) return;

		setIsDeleting(true);

		try {
			await deleteNews(orgId, newsId);
			router.push("/news"); // Redirect after deleting
		} catch (error) {
			console.error("Error deleting news:", error);
			alert("Failed to delete news.");
			setIsDeleting(false);
		}
	};

	return (
		<div className="flex flex-col min-h-screen bg-[#f5f6f8] p-8 font-sans items-center">
			<div className="w-full max-w-4xl">
				{/* Back Button */}
				<button
					onClick={() => router.back()}
					className="flex items-center gap-2 text-gray-500 hover:text-black font-semibold text-sm mb-6 transition-colors"
				>
					<svg
						className="w-4 h-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2.5"
							d="M10 19l-7-7m0 0l7-7m-7 7h18"
						/>
					</svg>
					Back
				</button>

				<h1 className="text-3xl font-bold text-gray-900 mb-8">Edit News</h1>

				<div className="bg-white rounded-2xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] p-8 md:p-10 border border-gray-100">
					<div className="flex flex-col gap-6">
						{/* Headline Input */}
						<div>
							<label className="block text-lg font-bold text-gray-900 mb-2">
								Headline
							</label>
							<input
								type="text"
								name="headline"
								placeholder="Enter the news headline here..."
								value={newsData.headline}
								onChange={handleChange}
								className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00abc0] transition-all"
							/>
						</div>

						<div className="flex flex-col md:flex-row gap-6">
							{/* Category Dropdown */}
							<div className="flex-1">
								<label className="block text-lg font-bold text-gray-900 mb-2">
									Category
								</label>
								<div className="relative">
									<select
										name="category"
										value={newsData.category}
										onChange={handleChange}
										className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm appearance-none bg-transparent focus:outline-none focus:ring-2 focus:ring-[#00abc0] cursor-pointer"
									>
										<option value="Education">Education</option>
										<option value="Health">Health</option>
										<option value="Research">Research</option>
										<option value="Healthcare">Healthcare</option>
									</select>
									<div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
										<svg
											className="w-4 h-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M19 9l-7 7-7-7"
											/>
										</svg>
									</div>
								</div>
							</div>

							{/* Date Input */}
							<div className="flex-1">
								<label className="block text-lg font-bold text-gray-900 mb-2">
									Date
								</label>
								<input
									type="date"
									name="date"
									value={newsData.date}
									onChange={handleChange}
									className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00abc0]"
								/>
							</div>
						</div>

						{/* Image URL Input */}
						<div>
							<label className="block text-lg font-bold text-gray-900 mb-2">
								Image URL link
							</label>
							<input
								type="text"
								name="imageUrl"
								placeholder="Paste the link to your news image..."
								value={newsData.imageUrl}
								onChange={handleChange}
								className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00abc0] text-gray-600"
							/>
						</div>

						{/* News URL Input */}
						<div>
							<label className="block text-lg font-bold text-gray-900 mb-2">
								News URL link
							</label>
							<input
								type="text"
								name="newsUrl"
								placeholder="Paste the full link to the original news article..."
								value={newsData.newsUrl}
								onChange={handleChange}
								className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00abc0] text-gray-600"
							/>
						</div>
					</div>
				</div>

				{/* Save Button */}
				<div className="flex justify-end items-center gap-3 mt-8">
					<button
						onClick={handleDelete}
						disabled={isDeleting || isSaving}
						className={`bg-white border-2 border-red-600 text-red-600 hover:bg-red-50 text-sm font-bold py-3.5 px-10 rounded-full transition-colors ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
					>
						{isDeleting ? "Deleting..." : "Delete News"}
					</button>
					<button
						onClick={handleSave}
						disabled={isSaving}
						className={`bg-black text-white text-sm font-bold py-3.5 px-16 rounded-full shadow-lg transition-all transform active:scale-95 ${isSaving ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"}`}
					>
						{isSaving ? "Saving..." : "Save Changes"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default EditNewsPage;
