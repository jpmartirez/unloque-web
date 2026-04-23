import React from "react";

interface StatCardProps {
	title: string;
	value: string;
	iconColor: string;
	isAlert?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
	title,
	value,
	iconColor,
	isAlert,
}) => {
	// Apply a red glowing shadow and red text if it's the alert card
	const cardClasses = isAlert
		? "bg-white p-6 rounded-2xl shadow-[0_0_20px_rgba(255,0,0,0.3)] border-2 border-red-100 flex flex-col justify-between"
		: "bg-white p-6 rounded-2xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] flex flex-col justify-between border border-transparent";

	const textValueClasses = isAlert
		? "text-4xl font-bold text-red-600"
		: "text-4xl font-bold text-black";

	return (
		<div className={cardClasses}>
			<div className="flex items-start justify-between mb-4">
				<div className="flex items-center gap-3">
					<div
						className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${iconColor}`}
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
								d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
							/>
						</svg>
					</div>
					<h3 className="text-gray-500 font-medium leading-tight max-w-25">
						{title}
					</h3>
				</div>

				{isAlert && (
					<div className="flex flex-col items-center">
						<div className="bg-red-600 text-white p-1 rounded">
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
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							</svg>
						</div>
						<span className="text-[10px] text-red-600 font-bold mt-1 text-center leading-tight">
							Attention
							<br />
							Required
						</span>
					</div>
				)}
			</div>

			<div className={textValueClasses}>{value}</div>
		</div>
	);
};

export default StatCard;
