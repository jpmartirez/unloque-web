import Image from "next/image";
import React from "react";

const Navbar = () => {
	return (
		<div className="shadow-2xl w-full py-5 flex items-center justify-between px-10">
			<div className="flex items-center gap-3"> 
				<Image
					src={"/unloquelogo.png"}
					alt="unloquelogo"
					width={24}
					height={24}
				/>
				<p className="text-black font-semibold text-2xl">Unloque</p>
			</div>

			<div>
				<button>
					<p>Help</p>
				</button>
			</div>
		</div>
	);
};

export default Navbar;
