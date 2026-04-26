export type ProgramStatus = "Open" | "Closed" | "Draft";

export type ProgramDetailSectionType = "paragraph" | "list" | "attachment";

export interface ProgramAttachmentFile {
	name: string;
	downloadUrl?: string;
	uploadedAt?: string;
}

export type ProgramDetailSection =
	| {
			id: string;
			type: "paragraph";
			label: string;
			content: string;
	  }
	| {
			id: string;
			type: "list";
			label: string;
			items: string[];
	  }
	| {
			id: string;
			type: "attachment";
			label: string;
			files: ProgramAttachmentFile[];
	  };

export type ProgramFormFieldType =
	| "short_answer"
	| "paragraph"
	| "multiple_choice"
	| "checkbox"
	| "date"
	| "attachment";

export interface ProgramFormField {
	id: string;
	type: ProgramFormFieldType;
	label: string;
	required: boolean;
	options?: string[];
	placeholder?: string;
}

export interface Program {
	id: string;
	name: string;
	organizationId: string;
	category: string;
	deadline: string;
	color: string | number;
	programStatus: ProgramStatus | string;
	createdAt?: any;
	lastUpdated?: any;

	detailSections?: ProgramDetailSection[];
	formFields?: ProgramFormField[];
}
