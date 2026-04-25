export type ApplicationStatus =
  | "pending"
  | "submitted"
  | "approved"
  | "rejected";

export interface Application {
  id: string;
  programId: string;
  organizationId: string;
  userId: string;
  _status: ApplicationStatus;
  submittedAt: string;
  lastUpdated: string;
}
