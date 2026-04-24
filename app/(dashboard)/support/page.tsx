"use client";

import React, { useState } from "react";

// --- Reusable FAQ Accordion Item ---
interface FAQItemProps {
	question: string;
	answer: string;
	isOpen: boolean;
	onClick: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({
	question,
	answer,
	isOpen,
	onClick,
}) => {
	return (
		<div className="border border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-200">
			<button
				onClick={onClick}
				className="w-full text-left px-6 py-4 flex justify-between items-center focus:outline-none hover:bg-gray-50"
			>
				<span className="font-bold text-gray-900 text-sm">{question}</span>
				<svg
					className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
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
			</button>

			{/* Answer Panel */}
			{isOpen && (
				<div className="px-6 pb-4 pt-1 border-t border-gray-100 text-gray-600 text-sm leading-relaxed bg-gray-50/50">
					{answer}
				</div>
			)}
		</div>
	);
};

// --- Main Support Page Component ---
const Support: React.FC = () => {
	const [openFaqId, setOpenFaqId] = useState<number | null>(null);

	// Sample FAQ Data based on your mockup
	const faqs = [
		{
			id: 1,
			question: "What is Unloque?",
			answer:
				"Unloque is a comprehensive platform designed to streamline and manage social welfare programs, track regional development progress, and monitor applicant data efficiently.",
		},
		{
			id: 2,
			question: "Who can use Unloque?",
			answer:
				"Unloque is built for program administrators, verified government personnel, and organizational staff who manage application data and beneficiary metrics.",
		},
		{
			id: 3,
			question: "Is Unloque a government app?",
			answer:
				"Unloque is a specialized platform used by governmental bodies and partnered organizations to handle public welfare programs and data.",
		},
		{
			id: 4,
			question: "How do I use Unloque Admin?",
			answer:
				"Once logged in, you can use the sidebar to navigate between your Dashboard, Programs, News, and Map Data to manage different aspects of your organization.",
		},
		{
			id: 5,
			question: "How do I add Programs?",
			answer:
				"Navigate to the 'Programs' tab using the left sidebar, and click the black 'Add Program' button located at the top right of the page.",
		},
		{
			id: 6,
			question: "How do I see the applications from my created program?",
			answer:
				"Go to the 'Programs' tab, locate the specific program card, and click the 'View Applications' button to see the detailed list of applicants.",
		},
	];

	const toggleFaq = (id: number) => {
		setOpenFaqId(openFaqId === id ? null : id);
	};

	return (
		<div className="flex flex-col gap-8 pb-12 w-full max-w-225">
			{/* Header */}
			<div>
				<h1 className="text-4xl font-bold text-gray-900 mb-2">
					Support & Help Center
				</h1>
			</div>

			{/* FAQ Card */}
			<div className="bg-white rounded-3xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] p-8 md:p-10 border border-gray-100">
				<h2 className="text-2xl font-bold text-gray-900 mb-8">FAQs</h2>

				<div className="flex flex-col gap-4">
					{faqs.map((faq) => (
						<FAQItem
							key={faq.id}
							question={faq.question}
							answer={faq.answer}
							isOpen={openFaqId === faq.id}
							onClick={() => toggleFaq(faq.id)}
						/>
					))}
				</div>
			</div>

			{/* Contact Us Card */}
			<div className="bg-white rounded-3xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] p-8 md:p-10 border border-gray-100 mt-2">
				<h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Us</h2>
				<p className="text-sm font-medium text-gray-700 mb-10">
					If you have any questions, please reach out using contacts below:
				</p>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 max-w-2xl mx-auto">
					{/* Email */}
					<div className="flex items-center gap-4">
						<div className="text-black">
							<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
								<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
							</svg>
						</div>
						<a
							href="mailto:unloque@gmail.com"
							className="text-sm font-bold text-gray-900 hover:underline"
						>
							unloque@gmail.com
						</a>
					</div>

					{/* Instagram */}
					<div className="flex items-center gap-4">
						<div className="text-black">
							<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
								<path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
							</svg>
						</div>
						<span className="text-sm font-bold text-gray-900">unloque@ig</span>
					</div>

					{/* Phone */}
					<div className="flex items-center gap-4">
						<div className="text-black">
							<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
								<path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
							</svg>
						</div>
						<span className="text-sm font-bold text-gray-900">09876547890</span>
					</div>

					{/* Facebook */}
					<div className="flex items-center gap-4">
						<div className="text-black">
							<svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
								<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h7v-7h-2v-3h2V8.5A3.5 3.5 0 0 1 15.5 5H18v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v7h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
							</svg>
						</div>
						<span className="text-sm font-bold text-gray-900">unloque@fb</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Support;
