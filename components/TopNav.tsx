import Image from "next/image";
import React from "react";

const TopNav: React.FC = () => {
	return (
		<header className="bg-white h-20 shadow-sm flex items-center justify-between px-8 z-10">
			{/* Logo Area */}
			<div className="flex items-center gap-3">
				{/* Placeholder for Unloque Logo */}
				<div className="">
					<Image
						src={"/unloquelogo.png"}
						width={24}
						height={24}
						alt="unloquelogo"
					/>
				</div>
				<span className="text-2xl font-bold text-gray-900 tracking-tight">
					Unloque
				</span>
			</div>
		</header>
	);
};

export default TopNav;
