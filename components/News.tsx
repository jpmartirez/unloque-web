import React from "react";

// --- Reusable News Card Component ---
interface NewsCardProps {
	title: string;
	date: string;
	// In a real app, you'd pass an imageUrl prop here.
	// imageUrl?: string;
}

const NewsCard: React.FC<NewsCardProps> = ({ title, date }) => {
	return (
		<div className="bg-white rounded-2xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden border border-gray-100 relative pt-2">
			{/* Top Teal Accent Line */}
			<div className="absolute top-0 left-0 w-full h-2 bg-[#00abc0]"></div>

			<div className="p-4 flex flex-col h-full mt-2">
				{/* Image Placeholder */}
				<div className="w-full h-32 bg-gray-200 rounded-xl mb-4 overflow-hidden relative">
					{/* Simulated Image - Replace with standard <img src={imageUrl} /> */}
					<div className="absolute inset-0 bg-slate-300 flex items-center justify-center">
						<svg
							className="w-8 h-8 text-slate-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
					</div>
				</div>

				{/* Text Content */}
				<div className="flex flex-col flex-1">
					{/* line-clamp-2 ensures the title cuts off nicely if it's too long */}
					<h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 mb-1">
						{title}
					</h3>
					<p className="text-[11px] text-gray-400 font-medium">
						Published: {date}
					</p>
				</div>

				{/* Action Button */}
				<div className="mt-6 flex justify-center">
					<button className="bg-black hover:bg-gray-800 text-white text-xs font-bold py-2.5 px-10 rounded-full transition-colors shadow-sm w-full max-w-40">
						Modify
					</button>
				</div>
			</div>
		</div>
	);
};

// --- Main News Page Component ---
const News: React.FC = () => {
	// Sample data to match your mockup
	const newsItems = [
		{
			id: 1,
			title: "DOST Unveil New dfjkdbf jdfd dfkndfnkdlnd dfn kd ...",
			date: "03/21/26",
		},
		{ id: 2, title: "DOST Unveil NewProgram", date: "03/21/26" },
		{ id: 3, title: "List of Passers is now Posted", date: "03/21/26" },
		{ id: 4, title: "List of Passers is now Posted", date: "03/21/26" },
	];

	return (
		<div className="flex flex-col gap-8 pb-12 w-full max-w-300">
			{/* Header Section */}
			<div>
				<h1 className="text-4xl font-bold text-gray-900 mb-2">DOST News</h1>
				<p className="text-gray-600 text-sm font-medium">
					Publish recent news article relating to your organization. Keep users
					updated.
				</p>
			</div>

			{/* Toolbar */}
			<div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-2">
				{/* Search Bar */}
				<div className="relative w-full md:max-w-xl">
					<input
						type="text"
						placeholder="Search published news"
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

				{/* Create News Button Group */}
				<div className="flex items-center gap-3 shrink-0">
					<button className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center hover:bg-gray-100 transition-colors">
						<svg
							className="w-6 h-6 text-black"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2.5"
								d="M12 4v16m8-8H4"
							/>
						</svg>
					</button>
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

				{/* Grid Container for Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
					{newsItems.map((item) => (
						<NewsCard key={item.id} title={item.title} date={item.date} />
					))}
				</div>
			</div>
		</div>
	);
};

export default News;
