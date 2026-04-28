export const PROGRAM_CATEGORIES = [
	"Educational",
	"Social",
	"Healthcare",
] as const;

export type ProgramCategory = (typeof PROGRAM_CATEGORIES)[number];
