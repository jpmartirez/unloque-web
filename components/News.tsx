"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getAllNews, type NewsItem } from "@/app/services/programService";
import Image from "next/image";
import { getNewsByOrg } from "@/app/services/newsService";

// --- Reusable News Card Component ---
const NewsCard = ({
	item,
}: {
	item: NewsItem & { programId: string }; // Now expects programId inside the item
}) => {
	return (
		<div className="bg-white rounded-2xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden border border-gray-100 relative pt-2">
			<div className="absolute top-0 left-0 w-full h-2 bg-[#00abc0]"></div>

			<div className="p-4 flex flex-col h-full mt-2">
				<div className="w-full h-32 bg-gray-200 rounded-xl mb-4 overflow-hidden relative flex items-center justify-center">
					{item.imageUrl ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={item.imageUrl}
							alt={item.headline}
							width={24}
							height={24}
							className="w-full h-full object-cover"
						/>
					) : (
						<span className="text-gray-400 text-xs font-bold">No Image</span>
					)}
				</div>

				<div className="flex flex-col flex-1">
					<h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 mb-1">
						{item.headline}
					</h3>
					<p className="text-[11px] text-gray-400 font-medium">
						Published: {item.date}
					</p>
				</div>

				<div className="mt-6 flex justify-center">
					{/* Link to the Edit Page passing the dynamically extracted programId */}
					<Link
						href={`/programs/edit/news/${item.id}`}
						className="bg-black hover:bg-gray-800 text-white text-xs font-bold py-2.5 px-10 rounded-full transition-colors shadow-sm w-full max-w-40 text-center"
					>
						Modify
					</Link>
				</div>
			</div>
		</div>
	);
};

// --- Main News Page Component ---
const News: React.FC = () => {
	const [news, setNews] = useState<(NewsItem & { programId: string })[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		const fetchNews = async () => {
			
			const orgId = localStorage.getItem("userOrgId");

			if (!orgId) {
				setIsLoading(false);
				return; 
			}

			try {
				
				const data = await getNewsByOrg(orgId);
				setNews(data);
			} catch (error) {
				console.error("Failed to load news", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchNews();
	}, []);

	// Search filter logic
	const filteredNews = news.filter((item) => {
		const query = searchQuery.toLowerCase();
		const headline = item.headline?.toLowerCase() || "";
		const category = item.category?.toLowerCase() || "";
		return headline.includes(query) || category.includes(query);
	});

	return (
		<div className="flex flex-col gap-8 pb-12 w-full max-w-300">
			{/* Header and Toolbar */}
			<div>
				<h1 className="text-4xl font-bold text-gray-900 mb-2">DOST News</h1>
				<p className="text-gray-600 text-sm font-medium">
					Publish recent news articles relating to your organization.
				</p>
			</div>

			<div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-2">
				<div className="relative w-full md:max-w-xl">
					<input
						type="text"
						placeholder="Search published news"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full bg-gray-200/70 border-none rounded-full py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#00abc0] transition-shadow placeholder-gray-400 font-medium"
					/>
					<svg
						className="w-5 h-5 text-gray-500 absolute left-4 top-3"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2.5"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				</div>

				<div className="flex items-center gap-3 shrink-0">
					<button className="bg-black hover:bg-gray-800 text-white font-semibold py-2.5 px-10 rounded-full text-sm transition-colors shadow-sm">
						Create News
					</button>
				</div>
			</div>

			{/* Published News Section */}
			<div className="mt-4">
				<h2 className="text-2xl font-bold text-gray-900 mb-6">
					Published News
				</h2>

				{isLoading ? (
					<p className="text-gray-500 font-medium">Loading news...</p>
				) : filteredNews.length === 0 ? (
					<p className="text-gray-500 font-medium">No news articles found.</p>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
						{filteredNews.map((item) => (
							<NewsCard key={item.id} item={item} />
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default News;
