export type ProgramStatus = "active" | "inactive" | "archived";

export interface Program {
  id: string;
  _programName: string;
  organizationId: string;
  _category: string;
  _programStatus: ProgramStatus;
  _color: string;
  _deadline: string; // ISO date string
  createdAt: string;
  lastUpdated: string;
}
