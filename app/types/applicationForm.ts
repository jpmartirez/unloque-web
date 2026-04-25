export type FieldType =
  | "short_answer"
  | "date"
  | "multiple_choice"
  | "paragraph"
  | "checkbox"
  | "attachment";

export interface FormField {
  id: string;
  _label: string;
  _type: FieldType;
  _required: boolean;
  _options?: string[]; // for multiple_choice / checkbox
  order: number;
}
