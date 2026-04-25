export interface FormResponse {
  id: string;
  fieldId: string;
  value: string | string[]; // string[] for checkbox/multiple_choice
}
