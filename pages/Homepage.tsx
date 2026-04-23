import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import React from "react";

const Homepage = () => {
	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />

			<main className=" flex grow flex-col md:flex-row justify-between items-start max-w-7xl  mx-auto p-8 gap-16  min-h-[70vh]">
				{/* Left Section - Login Area */}
				<section className="flex-1 w-full flex flex-col items-center mt-8">
					{/* Header with bottom border */}
					<div className="w-full border-b border-gray-400 pb-2 mb-20">
						<h1 className="text-4xl md:text-5xl font-light text-gray-900 tracking-wide">
							Welcome to Unloque!
						</h1>
					</div>

					{/* Login Controls */}
					<div className="w-full max-w-100 flex flex-col items-center gap-8">
						<button
							type="button"
							className="w-full bg-[#12a4b6] hover:bg-[#0f8c9b] text-white text-2xl font-medium py-3 px-8 rounded-full transition-colors duration-200 shadow-sm"
						>
							Log In
						</button>

						<button
							type="button"
							className="text-gray-800 text-lg hover:underline bg-transparent border-none cursor-pointer"
						>
							Forgot Password
						</button>
					</div>
				</section>

				{/* Right Section - Announcement Sidebar */}
				<aside className="w-full md:w-100 flex flex-col mt-8">
					{/* Sidebar Header with bottom border */}
					<div className="border-b border-gray-400 pb-2 mb-6 w-full">
						<h2 className="text-3xl font-light text-gray-900 tracking-wide">
							Announcement
						</h2>
					</div>

					{/* Announcement Box */}
					<div className="border border-gray-600 p-8 flex flex-col gap-6 text-center text-gray-800 bg-white shadow-sm">
						<div className="inline-block mx-auto">
							<h3 className="text-xl font-light border-b border-gray-400 pb-1">
								Welcome, Admin!
							</h3>
						</div>

						<p className="leading-relaxed text-sm">
							We are pleased to inform you that each of you will be receiving a
							unique Employee ID and password. This will allow you to log in to
							our companys website easily.
						</p>

						{/* Instructions Divider */}
						<div className="text-gray-400 tracking-[0.2em] flex items-center justify-center gap-3 text-xl font-light my-2">
							&gt;&gt;&gt;
							<span className="text-[#cc0000] font-bold tracking-normal text-lg">
								Instructions
							</span>
							&lt;&lt;&lt;
						</div>

						<p className="leading-relaxed text-sm">
							Stay informed on system updates and new functionalities here.
						</p>

						<p className="leading-relaxed text-sm mt-4">
							Note: If you have any problems with your account. Please contact
							your IT department.
						</p>
					</div>
				</aside>
			</main>

			<Footer />
		</div>
	);
};

export default Homepage;
