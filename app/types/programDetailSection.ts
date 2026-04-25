export type SectionType = "paragraph" | "list";

export interface DetailSection {
  id: string;
  _type: SectionType;
  _label: string;
  _content?: string; // for paragraph
  _items?: string[]; // for list
}
