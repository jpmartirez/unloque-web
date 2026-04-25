import { NextResponse } from "next/server";
import { getPrograms, createProgram } from "@/app/services/programService";

// ─── GET: Fetch all programs ────────────────────────────────────
export async function GET() {
	try {
		const programs = await getPrograms();

		// Return the programs array with a 200 OK status
		return NextResponse.json(programs, { status: 200 });
	} catch (error) {
		console.error("Error in GET /api/programs:", error);
		return NextResponse.json(
			{ error: "Failed to fetch programs" },
			{ status: 500 },
		);
	}
}

// ─── POST: Create a new program ─────────────────────────────────
export async function POST(request: Request) {
	try {
		// Extract the JSON body sent from the client (or Postman)
		const body = await request.json();

		// Pass the data to your Firebase service function
		const newProgramId = await createProgram(body);

		// Return the newly created document ID with a 201 Created status
		return NextResponse.json(
			{ message: "Program created successfully", id: newProgramId },
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error in POST /api/programs:", error);
		return NextResponse.json(
			{ error: "Failed to create program" },
			{ status: 500 },
		);
	}
}


